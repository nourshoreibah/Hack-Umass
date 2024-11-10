from flask import jsonify, request
from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import aliased
from sqlalchemy import and_, union_all, or_, func
from models import User, UserSkills, UserGoals, CommunityRatings, Skills, FluencyLevel, Requests, RequestStatus, session, Session
from contextlib import contextmanager



@contextmanager
def session_scope():
    """Provide a transactional scope around a series of operations."""
    session = Session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
 

# Create namespace
api_ns = Namespace('api', description='API operations')

# Define response models
skill_model = api_ns.model('Skill', {
    'skill_id': fields.Integer(description='Skill ID'),
    'skill_name': fields.String(description='Skill name'),
    'fluency_level': fields.String(description='Fluency level'),
})

user_with_skills_model = api_ns.model('UserWithSkills', {
    'user_id': fields.Integer(description='User ID'),
    'display_name': fields.String(description='Display name'),
    'matching_skills': fields.List(fields.Nested(skill_model)),
})

compatible_users_model = api_ns.model('CompatibleUsers', {
    'users': fields.List(fields.Nested(user_with_skills_model)),
})


def find_compatible_users_with_skills(user_id):
    try:
        with session_scope() as session:
            # Subqueries for user's goals and skills
            user_goals_sub = session.query(UserGoals.skill_id).filter(UserGoals.user_id == user_id).subquery()
            user_skills_sub = session.query(UserSkills.skill_id).filter(UserSkills.user_id == user_id).subquery()

            # Users who can teach me (have skills I want to learn)
            users_can_teach_me = (
                session.query(
                    UserSkills.user_id.label('other_user_id'),
                    func.count(UserSkills.skill_id).label('skills_can_teach_me')
                )
                .filter(UserSkills.skill_id.in_(user_goals_sub))
                .filter(UserSkills.user_id != user_id)
                .group_by(UserSkills.user_id)
                .subquery()
            )

            # Users who want to learn from me (have goals in my skills)
            users_want_to_learn_from_me = (
                session.query(
                    UserGoals.user_id.label('other_user_id'),
                    func.count(UserGoals.skill_id).label('skills_want_to_learn_from_me')
                )
                .filter(UserGoals.skill_id.in_(user_skills_sub))
                .filter(UserGoals.user_id != user_id)
                .group_by(UserGoals.user_id)
                .subquery()
            )

            # Average community ratings
            user_ratings = (
                session.query(
                    CommunityRatings.rated_id.label('other_user_id'),
                    func.avg(CommunityRatings.rating).label('average_rating')
                )
                .group_by(CommunityRatings.rated_id)
                .subquery()
            )

            # Exclude users with existing outgoing or incoming requests
            excluded_user_ids = (
                session.query(Requests.requested_id)
                .filter(Requests.requester_id == user_id)
                .union(
                    session.query(Requests.requester_id)
                    .filter(Requests.requested_id == user_id)
                )
                .subquery()
            )

            # Combine all users with their respective counts and ratings
            all_users = (
                session.query(
                    User.user_id,
                    User.display_name,
                    func.coalesce(users_can_teach_me.c.skills_can_teach_me, 0).label('skills_can_teach_me'),
                    func.coalesce(users_want_to_learn_from_me.c.skills_want_to_learn_from_me, 0).label('skills_want_to_learn_from_me'),
                    func.coalesce(user_ratings.c.average_rating, 0).label('average_rating')
                )
                .outerjoin(users_can_teach_me, User.user_id == users_can_teach_me.c.other_user_id)
                .outerjoin(users_want_to_learn_from_me, User.user_id == users_want_to_learn_from_me.c.other_user_id)
                .outerjoin(user_ratings, User.user_id == user_ratings.c.other_user_id)
                .filter(User.user_id != user_id)
                .filter(User.user_id.notin_(excluded_user_ids))
                .limit(50)
                .all()
            )

            # Calculate matching score and prepare user list
            users_list = []
            for user in all_users:
                matching_score = (user.skills_can_teach_me * 2) + user.skills_want_to_learn_from_me + user.average_rating
                users_list.append({
                    'user_id': user.user_id,
                    'display_name': user.display_name,
                    'skills_can_teach_me': user.skills_can_teach_me,
                    'skills_want_to_learn_from_me': user.skills_want_to_learn_from_me,
                    'average_rating': round(user.average_rating, 2),
                    'matching_score': matching_score
                })

            # Sort users by matching score in descending order
            sorted_users = sorted(users_list, key=lambda x: x['matching_score'], reverse=True)

            # Fetch matching skills for each user
            for user in sorted_users:
                # Skills they can teach me
                teaching_skills = (
                    session.query(Skills.skill_id, Skills.skill_name)
                    .join(UserSkills, UserSkills.skill_id == Skills.skill_id)
                    .filter(
                        UserSkills.user_id == user['user_id'],
                        UserSkills.skill_id.in_(user_goals_sub)
                    )
                    .all()
                )

                # Skills they want to learn from me
                learning_skills = (
                    session.query(Skills.skill_id, Skills.skill_name)
                    .join(UserGoals, UserGoals.skill_id == Skills.skill_id)
                    .filter(
                        UserGoals.user_id == user['user_id'],
                        UserGoals.skill_id.in_(user_skills_sub)
                    )
                    .all()
                )

                user['matching_skills'] = {
                    'can_learn_from_them': [{'skill_id': s.skill_id, 'skill_name': s.skill_name} for s in teaching_skills],
                    'can_teach_them': [{'skill_id': s.skill_id, 'skill_name': s.skill_name} for s in learning_skills]
                }

            return sorted_users

    except Exception as e:
        print(f"Error in find_compatible_users_with_skills: {e}")
        session.rollback()
        raise

# Get user by id
@api_ns.route('/user/<int:user_id>')
class GetUser(Resource):
    @api_ns.doc('get_user')
    def get(self, user_id):
        """Get user by ID"""
        user = session.query(User).filter_by(user_id=user_id).first()
        if not user:
            return {'msg': 'User not found'}, 404
        return {'user_id': user.user_id, 'display_name': user.display_name}

@api_ns.route('/get_current_user')
class CurrentUser(Resource):
    @api_ns.doc('get_current_user')
    @jwt_required()
    def get(self):
        """Get the current authenticated user"""
        current_user_id = get_jwt_identity()
        user = session.query(User).filter_by(user_id=current_user_id).first()
        if not user:
            return {'msg': 'User not found'}, 404
        return {
            'user_id': user.user_id,
            'display_name': user.display_name,
            'has_logged_in': user.has_logged_in,
        }

@api_ns.route('/compatible_users')
class CompatibleUsers(Resource):
    @api_ns.doc('get_compatible_users')
    @api_ns.marshal_with(compatible_users_model)
    @jwt_required()
    def get(self):
        """Get compatible users along with matching skills and fluency level"""
        try: 
            current_user_id = get_jwt_identity()
            users = find_compatible_users_with_skills(current_user_id)
        except Exception as e:
            print(str(e))
            return {'msg': 'Error finding compatible users'}, 500
        if not users:
            return {'msg': 'No compatible users found'}, 404
        return {'users': users}

# Add namespace to API
# Define request model for making a request
make_request_model = api_ns.model('MakeRequest', {
    'requested_id': fields.Integer(required=True, description='ID of the user to send a request to')
})

# Define response model for making a request
make_request_response_model = api_ns.model('MakeRequestResponse', {
    'msg': fields.String(description='Response message')
})

@api_ns.route('/make_request')
class MakeRequest(Resource):
    @api_ns.doc('make_request')
    @api_ns.expect(make_request_model)
    @api_ns.marshal_with(make_request_response_model)
    @jwt_required()
    def post(self):
        """Make a request to another user"""
        current_user_id = get_jwt_identity()
        data = request.get_json()
        requested_id = data.get('requested_id')

        # Check if the requested user exists
        requested_user = session.query(User).filter_by(user_id=requested_id).first()

        if not requested_user:
            return {'msg': 'Requested user not found'}, 404

        # Check if a request already exists
        existing_request = session.query(Requests).filter_by(requester_id=current_user_id, requested_id=requested_id).first()
        if existing_request:
            return {'msg': 'Request already sent'}, 400

        # Create a new request
        new_request = Requests(
            requester_id=current_user_id,
            requested_id=requested_id,
            status=RequestStatus.default
        )
        session.add(new_request)
        session.commit()

        return {'msg': 'Request sent successfully'}, 201
    

# Define response model for incoming requests
incoming_request_model = api_ns.model('IncomingRequest', {
    'requester_id': fields.Integer(description='ID of the user who sent the request'),
    'requester_display_name': fields.String(description='Display name of the user who sent the request'),
    'status': fields.String(description='Status of the request')
})

# Define response model for incoming requests list
incoming_requests_response_model = api_ns.model('IncomingRequestsResponse', {
    'requests': fields.List(fields.Nested(incoming_request_model))
})

@api_ns.route('/incoming_requests')
class IncomingRequests(Resource):
    @api_ns.doc('get_incoming_requests')
    @api_ns.marshal_with(incoming_requests_response_model)
    @jwt_required()
    def get(self):
        """Get current incoming requests for the logged-in user"""
        current_user_id = get_jwt_identity()

        # Query incoming requests
        incoming_requests = (
            session.query(Requests, User.display_name)
            .join(User, User.user_id == Requests.requester_id)
            .filter(Requests.requested_id == current_user_id)
            .filter(Requests.status == RequestStatus.default)
            .all()
        )

        # Format the response
        requests_list = [
            {
                'requester_id': request.Requests.requester_id,
                'requester_display_name': request.display_name,
                'status': request.Requests.status.value
            }
            for request in incoming_requests
        
        ]


        return {'requests': requests_list}

# Define response model for outgoing requests
outgoing_request_model = api_ns.model('OutgoingRequest', {
    'requested_id': fields.Integer(description='ID of the user to whom the request was sent'),
    'requested_display_name': fields.String(description='Display name of the user to whom the request was sent'),
    'status': fields.String(description='Status of the request')
})

# Define response model for outgoing requests list
outgoing_requests_response_model = api_ns.model('OutgoingRequestsResponse', {
    'requests': fields.List(fields.Nested(outgoing_request_model))
})

@api_ns.route('/outgoing_requests')
class OutgoingRequests(Resource):
    @api_ns.doc('get_outgoing_requests')
    @api_ns.marshal_with(outgoing_requests_response_model)
    @jwt_required()
    def get(self):
        """Get current outgoing requests for the logged-in user"""
        current_user_id = get_jwt_identity()

        # Query outgoing requests
        outgoing_requests = (
            session.query(Requests, User.display_name)
            .join(User, User.user_id == Requests.requested_id)
            .filter(Requests.requester_id == current_user_id)
            .filter(Requests.status == RequestStatus.default)
            .all()
        )
        

        # Format the response
        requests_list = [
            {
                'requested_id': request.Requests.requested_id,
                'requested_display_name': request.display_name,
                'status': request.Requests.status.value
            }
            for request in outgoing_requests
        ]

        return {'requests': requests_list}

# Define request models for accepting and declining invites
accept_invite_model = api_ns.model('AcceptInvite', {
    'requester_id': fields.Integer(required=True, description="ID of the user who sent the invite")
})

decline_invite_model = api_ns.model('DeclineInvite', {
    'requester_id': fields.Integer(required=True, description="ID of the user who sent the invite")
})

# Define response models for accepting and declining invites
invite_response_model = api_ns.model('InviteResponse', {
    'msg': fields.String(description="Response message")
})

# Endpoint to accept an invite
@api_ns.route('/accept_invite')
class AcceptInvite(Resource):
    @api_ns.doc('accept_invite')
    @api_ns.expect(accept_invite_model)
    @api_ns.marshal_with(invite_response_model)
    @jwt_required()
    def post(self):
        """Accept an invite from another user"""
        current_user_id = get_jwt_identity()
        data = request.get_json()
        requester_id = data.get('requester_id')

        # Find the request from the requester
        invite_request = session.query(Requests).filter_by(requested_id=current_user_id, requester_id=requester_id).first()
        if not invite_request:
            return {'msg': 'Invite not found'}, 404

        # Update the status of the invite to 'accepted'
        invite_request.status = RequestStatus.accepted
        session.commit()

        return {'msg': 'Invite accepted successfully'}, 200

# Endpoint to decline an invite
@api_ns.route('/decline_invite')
class DeclineInvite(Resource):
    @api_ns.doc('decline_invite')
    @api_ns.expect(decline_invite_model)
    @api_ns.marshal_with(invite_response_model)
    @jwt_required()
    def post(self):
        """Decline an invite from another user"""
        current_user_id = get_jwt_identity()
        data = request.get_json()
        requester_id = data.get('requester_id')

        # Find the request from the requester
        invite_request = session.query(Requests).filter_by(requested_id=current_user_id, requester_id=requester_id).first()
        if not invite_request:
            return {'msg': 'Invite not found'}, 404

        # Update the status of the invite to 'declined'
        invite_request.status = RequestStatus.declined
        session.commit()

        return {'msg': 'Invite declined successfully'}, 200

@api_ns.route('/skills')
class SkillsResource(Resource):
    @api_ns.doc('get_skills')
    @jwt_required()
    def get(self):
        """Get all skills"""
        with session_scope() as session:
            try:
                skills = session.query(Skills).all()
                skills_list = [{'skill_id': skill.skill_id, 'skill_name': skill.skill_name} for skill in skills]
                return {'skills': skills_list}
            except Exception as e:
                session.rollback()
                print(f"Error retrieving skills: {e}")
                return {'msg': 'Error retrieving skills'}, 500

    


# Get connections
@api_ns.route('/connections')
class Connections(Resource):
    @api_ns.doc('get_connections')
    @jwt_required()
    def get(self):
        """Get all connections for the logged-in user"""
        current_user_id = get_jwt_identity()

        # Subquery for connections where the current user is the requester
        connections_requester = (
            session.query(User.user_id, User.display_name, User.email)
            .join(Requests, User.user_id == Requests.requested_id)
            .filter(
                Requests.requester_id == current_user_id,
                Requests.status == RequestStatus.accepted
            )
        )

        # Subquery for connections where the current user is the requested
        connections_requested = (
            session.query(User.user_id, User.display_name, User.email)
            .join(Requests, User.user_id == Requests.requester_id)
            .filter(
                Requests.requested_id == current_user_id,
                Requests.status == RequestStatus.accepted
            )
        )

        # Combine the two queries
        combined_connections = connections_requester.union_all(connections_requested).all()

        # Format the response
        connections_list = [
            {
                'user_id': user.user_id,
                'display_name': user.display_name,
                'email': user.email,
            }
            for user in combined_connections
        ]

        return {'connections': connections_list}

    
# Rate user endpoint
@api_ns.route('/rate_user')
class RateUser(Resource):
    @api_ns.doc('rate_user')
    @jwt_required()
    def post(self):
        """Rate a user"""
        current_user_id = get_jwt_identity()
        data = request.get_json()
        rated_id = data.get('rated_id')
        rating = data.get('rating')

        # Check if the user to be rated exists
        rated_user = session.query(User).filter_by(user_id=rated_id).first()
        if not rated_user:
            return {'msg': 'User not found'}, 404

        # Check if the rating is valid
        if rating < 1 or rating > 5:
            return {'msg': 'Invalid rating value. Rating must be between 1 and 5'}, 400

        # Check if the user has already rated the user
        existing_rating = session.query(CommunityRatings).filter_by(rater_id=current_user_id, rated_id=rated_id).first()
        if existing_rating:
            existing_rating.rating = rating
            session.commit()
            return {'msg': 'Rating updated successfully'}, 200


        # Create a new rating
        new_rating = CommunityRatings(
            rater_id=current_user_id,
            rated_id=rated_id,
            rating=rating
        )
        session.add(new_rating)
        session.commit()

        return {'msg': 'User rated successfully'}, 201

def numToLevel(num): 
    if num == 1:
        return FluencyLevel.beginner
    elif num == 2:
        return FluencyLevel.medium
    elif num == 3:
        return FluencyLevel.advanced
    else:
        return None

@api_ns.route('/submit_learning_skills')
class SubmitLearningSkills(Resource):
    @api_ns.doc('submit_learning_skills')
    @jwt_required()
    def post(self):
        """Add learning skills"""
        current_user_id = get_jwt_identity()
        data = request.get_json().get('skillRating', {})
        ratings = data.get('ratings', {})

        with session_scope() as session:
            for skill_name in ratings:
                rating = ratings[skill_name]
                level = numToLevel(rating)
                if level is None:
                    level = FluencyLevel.beginner

                # Find or create the skill
                skill = session.query(Skills).filter_by(skill_name=skill_name).first()
                if not skill:
                    continue

                # Add or update UserGoals
                user_goal = session.query(UserGoals).filter_by(
                    user_id=current_user_id, skill_id=skill.skill_id
                ).first()
                if not user_goal:
                    user_goal = UserGoals(
                        user_id=current_user_id, skill_id=skill.skill_id, level=level
                    )
                    session.add(user_goal)
                else:
                    user_goal.level = level

            session.commit()
        return {'msg': 'Learning skills and levels submitted successfully'}, 201

# user_routes.py

@api_ns.route('/submit_teaching_skills')
class SubmitTeachingSkills(Resource):
    @api_ns.doc('submit_teaching_skills')
    @jwt_required()
    def post(self):
        """Add teaching skills"""
        current_user_id = get_jwt_identity()
        data = request.get_json().get('skillRating', {})
        ratings = data.get('ratings', [])
        with session_scope() as session:
            for skill in ratings:
                level = numToLevel(ratings[skill])
                if level is None:
                    continue
                skill = session.query(Skills).filter_by(skill_name=skill).first()
                if not skill:
                    continue

                # Add or update UserGoals
                user_skill = session.query(UserSkills).filter_by(
                    user_id=current_user_id, skill_id=skill.skill_id
                ).first()
                if not user_skill:
                    user_skill = UserSkills(
                        user_id=current_user_id, skill_id=skill.skill_id, fluency_level=level
                    )
                    session.add(user_skill)
                else:
                    user_skill.fluency_level = level
            session.commit()
        current_user = session.query(User).filter_by(user_id=current_user_id).first()
        current_user.has_logged_in = True
        session.commit()
        return {'msg': 'Teaching skills and levels submitted successfully'}, 201                





@api_ns.route('/has_logged_in')
class HasLoggedIn(Resource):
    @api_ns.doc('Find whether a user has logged in')
    @jwt_required()
    def post(self):
        """Find whether a user has logged in yet"""
        current_user_id = get_jwt_identity()
        with session_scope() as session:
            current_user = session.query(User).filter_by(user_id=current_user_id).first()
            return {'has_logged_in': current_user.has_logged_in}, 200



@api_ns.route('/user/goals')
class UserGoalsResource(Resource):
    @api_ns.doc('get_user_goals')
    @jwt_required()
    def get(self):
        """Get the authenticated user's skill goals and their current status (FluencyLevel)"""
        try:
            current_user_id = get_jwt_identity()
            goals = session.query(UserGoals, Skills.skill_name, UserGoals.level).join(Skills, UserGoals.skill_id == Skills.skill_id).filter(UserGoals.user_id == current_user_id).all()
            if not goals:
                return {'msg': 'No goals found for this user'}, 404

            goals_list = [{'skill_name': goal.skill_name, 'level': goal.level.value} for goal, skill_name, level in goals]
            return {'goals': goals_list}, 200
        except Exception as e:
            print(f"Error retrieving user goals: {e}")
            return {'msg': 'Error retrieving user goals'}, 500


@api_ns.route('/user/skills')
class UserSkillsResource(Resource):
    @api_ns.doc('get_user_skills')
    @jwt_required()
    def get(self):
        """Get the authenticated user's skills and their current fluency level"""
        current_user_id = get_jwt_identity()
        with session_scope() as session:
            try:
                skills = session.query(UserSkills, Skills.skill_name, UserSkills.fluency_level).join(
                    Skills, UserSkills.skill_id == Skills.skill_id).filter(UserSkills.user_id == current_user_id).all()
                if not skills:
                    return {'msg': 'No skills found for this user'}, 404

                skills_list = [
                    {'skill_name': skill_name, 'fluency_level': fluency_level.value}
                    for skill, skill_name, fluency_level in skills
                ]
                return {'skills': skills_list}, 200
            except Exception as e:
                session.rollback()
                print(f"Error retrieving user skills: {e}")
                return {'msg': 'Error retrieving user skills'}, 500
