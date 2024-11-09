from flask import jsonify
from flask_restx import Resource, Namespace, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import aliased
from sqlalchemy import and_
from models import User, UserSkills, UserGoals, CommunityRatings, session

# Create namespace
api_ns = Namespace('api', description='API operations')

# Define response model
compatible_users_model = api_ns.model('CompatibleUsers', {
    'user_ids': fields.List(fields.Integer, description='List of compatible user IDs')
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

@api_ns.route('/compatible_users')
class CompatibleUsers(Resource):
    @api_ns.doc('get_compatible_users')
    @api_ns.marshal_with(compatible_users_model)
    @jwt_required()
    def get(self):
        """Get list of compatible users for the current user"""
        current_user_id = get_jwt_identity()
        compatible_users = find_compatible_users(current_user_id)
        return {'user_ids': [user.user_id for user in compatible_users]}

# Add namespace to API


# Remove blueprint registration if it exists
# app.register_blueprint(user_routes)