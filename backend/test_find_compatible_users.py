# test_find_compatible_users.py

from models import User, UserSkills, UserGoals, Skills, FluencyLevel, session
from user_routes import find_compatible_users_with_skills

# Add sample data if it doesn't already exist

# Create skills
def get_or_create_skill(skill_name):
    skill = session.query(Skills).filter_by(skill_name=skill_name).first()
    if not skill:
        skill = Skills(skill_name=skill_name)
        session.add(skill)
        session.commit()
    return skill

skill_python = get_or_create_skill('Python')
skill_java = get_or_create_skill('Java')

# Create users
def get_or_create_user(email, display_name):
    user = session.query(User).filter_by(email=email).first()
    if not user:
        user = User(email=email, password_hash='hashed_password', display_name=display_name)
        session.add(user)
        session.commit()
    return user

user_current = get_or_create_user('current@example.com', 'Current User')
user_other1 = get_or_create_user('other1@example.com', 'Other User 1')
user_other2 = get_or_create_user('other2@example.com', 'Other User 2')

# Assign goals to the current user
def add_user_goal(user_id, skill_id):
    exists = session.query(UserGoals).filter_by(user_id=user_id, skill_id=skill_id).first()
    if not exists:
        user_goal = UserGoals(user_id=user_id, skill_id=skill_id)
        session.add(user_goal)
        session.commit()

add_user_goal(user_current.user_id, skill_python.skill_id)

# Assign skills to other users
def add_user_skill(user_id, skill_id, fluency_level):
    exists = session.query(UserSkills).filter_by(user_id=user_id, skill_id=skill_id).first()
    if not exists:
        user_skill = UserSkills(
            user_id=user_id,
            skill_id=skill_id,
            fluency_level=fluency_level
        )
        session.add(user_skill)
        session.commit()

add_user_skill(user_other1.user_id, skill_python.skill_id, FluencyLevel.advanced)
add_user_skill(user_other2.user_id, skill_java.skill_id, FluencyLevel.medium)

# Invoke the function
compatible_users = find_compatible_users_with_skills(user_current.user_id)

# Print the results
print("Compatible Users:")
for user in compatible_users:
    print(f"User ID: {user['user_id']}, Display Name: {user['display_name']}")
    for skill in user['matching_skills']:
        print(f"  Skill ID: {skill['skill_id']}, Skill Name: {skill['skill_name']}, Fluency Level: {skill['fluency_level']}")

# Close the session if necessary
session.close()