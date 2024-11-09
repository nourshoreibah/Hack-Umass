from flask import jsonify
from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import aliased
from sqlalchemy import and_
from models import User, UserSkills, UserGoals, CommunityRatings, Skills, FluencyLevel, session

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

def find_compatible_users(user_id):
    # Existing function remains the same
    UserAlias = aliased(User)
    UserSkillsAlias = aliased(UserSkills)
    UserGoalsAlias = aliased(UserGoals)
    CommunityRatingsAlias = aliased(CommunityRatings)

    compatible_users = (
        session.query(UserAlias)
        .join(UserSkills, UserSkills.user_id == user_id)
        .join(UserGoalsAlias, UserGoalsAlias.skill_id == UserSkills.skill_id)
        .join(UserSkillsAlias, UserSkillsAlias.user_id == UserGoalsAlias.user_id)
        .join(UserGoals, UserGoals.user_id == user_id)
        .join(CommunityRatingsAlias, and_(
            CommunityRatingsAlias.rater_id == user_id,
            CommunityRatingsAlias.rated_id == UserAlias.user_id,
            CommunityRatingsAlias.rating >= 3
        ))
        .filter(UserGoals.skill_id == UserSkillsAlias.skill_id)
        .filter(UserAlias.user_id != user_id)
        .all()
    )
    return compatible_users

def find_compatible_users_with_skills(user_id):
    # Get the skills the current user wants to learn
    goal_skill_ids = (
        session.query(UserGoals.skill_id)
        .filter(UserGoals.user_id == user_id)
        .subquery()
    )

    # Find other users who have these skills with their fluency levels
    other_user_skills = (
        session.query(
            UserSkills.user_id,
            UserSkills.skill_id,
            UserSkills.fluency_level
        )
        .filter(UserSkills.skill_id.in_(goal_skill_ids))
        .filter(UserSkills.user_id != user_id)
        .subquery()
    )

    # Get user, skill details, and fluency level
    compatible_users = (
        session.query(User, Skills, other_user_skills.c.fluency_level)
        .join(other_user_skills, User.user_id == other_user_skills.c.user_id)
        .join(Skills, Skills.skill_id == other_user_skills.c.skill_id)
        .all()
    )

    # Organize data
    users_dict = {}
    for user, skill, fluency_level in compatible_users:
        if user.user_id not in users_dict:
            users_dict[user.user_id] = {
                'user_id': user.user_id,
                'display_name': user.display_name,
                'matching_skills': []
            }
        users_dict[user.user_id]['matching_skills'].append({
            'skill_id': skill.skill_id,
            'skill_name': skill.skill_name,
            'fluency_level': fluency_level.value  # Get enum value as string
        })

    return list(users_dict.values())

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

@api_ns.route('/current_user')
class CurrentUser(Resource):
    @api_ns.doc('get_current_user')
    @api_ns.marshal_with(user_with_skills_model)  # Ensure user_model is defined
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
          # Include other relevant fields
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
            return {'msg': 'Error finding compatible users: ' + e}, 500
        if not users:
            return {'msg': 'No compatible users found'}, 404
        return {'users': users}

# Add namespace to API


# Remove blueprint registration if it exists
# app.register_blueprint(user_routes)