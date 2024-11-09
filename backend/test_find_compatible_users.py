# test_find_compatible_users.py

from models import User, UserSkills, UserGoals, Skills, FluencyLevel, session
from user_routes import find_compatible_users_with_skills

# Helper functions to avoid duplicate entries
def get_or_create_skill(skill_name):
    skill = session.query(Skills).filter_by(skill_name=skill_name).first()
    if not skill:
        skill = Skills(skill_name=skill_name)
        session.add(skill)
        session.commit()
    return skill

def get_or_create_user(email, display_name):
    user = session.query(User).filter_by(email=email).first()
    if not user:
        user = User(email=email, password_hash='hashed_password', display_name=display_name)
        session.add(user)
        session.commit()
    return user

def add_user_goal(user_id, skill_id):
    exists = session.query(UserGoals).filter_by(user_id=user_id, skill_id=skill_id).first()
    if not exists:
        user_goal = UserGoals(user_id=user_id, skill_id=skill_id)
        session.add(user_goal)
        session.commit()

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

# Ensure the user with email "hello@example.com" exists
user_nour = get_or_create_user('joe@gmail.com', 'Hello User')
user_tyler = get_or_create_user('hello@example.com', 'Hello User')

print(user_nour.display_name)

# Create some skills
skill_python = get_or_create_skill('Python')
skill_javascript = get_or_create_skill('JavaScript')
skill_swift = get_or_create_skill('Swift')

# Assign goals to the user
add_user_goal(user_nour.user_id, skill_python.skill_id)
add_user_goal(user_nour.user_id, skill_javascript.skill_id)
add_user_skill(user_nour.user_id, skill_swift.skill_id, FluencyLevel.medium)

add_user_skill(user_tyler.user_id, skill_python.skill_id, FluencyLevel.advanced)
add_user_skill(user_tyler.user_id, skill_swift.skill_id, FluencyLevel.advanced)


# Create other users who have the skills the user wants to learn
user_other1 = get_or_create_user('user1@example.com', 'User One')
user_other2 = get_or_create_user('user2@example.com', 'User Two')

# Assign skills to other users
add_user_skill(user_other1.user_id, skill_python.skill_id, FluencyLevel.advanced)
add_user_skill(user_other1.user_id, skill_javascript.skill_id, FluencyLevel.beginner)
add_user_skill(user_other2.user_id, skill_javascript.skill_id, FluencyLevel.medium)


# Invoke the function to find compatible users
compatible_users = find_compatible_users_with_skills(user_nour.user_id)

# Print the results
print("Compatible Users for hello@example.com:")
for user in compatible_users:
    print(f"User ID: {user['user_id']}, Display Name: {user['display_name']}")
    for skill in user['matching_skills']:
        print(f"  Skill ID: {skill['skill_id']}, Skill Name: {skill['skill_name']}, Fluency Level: {skill['fluency_level']}")

# Close the session if necessary
# session.close()