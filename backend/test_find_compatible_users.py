# test_find_compatible_users.py

from models import User, UserSkills, UserGoals, Skills, FluencyLevel, Requests, session, engine
from user_routes import find_compatible_users_with_skills
from sqlalchemy import text



res = session.query(User).filter_by(email="johnjoe2@gmail.com").first()
print(res.has_logged_in)


# # List of coding languages
# coding_languages = [
#     "JavaScript",
#     "Python",
#     "Java",
#     "C#",
#     "C/C++",
#     "PHP",
#     "R",
#     "TypeScript",
#     "Swift",
#     "Go (Golang)",
#     "Ruby",
#     "MATLAB",
#     "Kotlin",
#     "Rust",
#     "Perl",
#     "Scala",
#     "Dart",
#     "Lua",
#     "Objective-C",
#     "Shell (Bash)"
# ]

# # Helper functions to avoid duplicate entries
# def get_or_create_skill(skill_name):
#     skill = session.query(Skills).filter_by(skill_name=skill_name).first()
#     if not skill:
#         skill = Skills(skill_name=skill_name)
#         session.add(skill)
#         session.commit()
#     return skill

# def get_or_create_user(email, display_name):
#     user = session.query(User).filter_by(email=email).first()
#     if not user:
#         user = User(email=email, password_hash='hashed_password', display_name=display_name)
#         session.add(user)
#         session.commit()
#     return user

# def add_user_goal(user_id, skill_id):
#     exists = session.query(UserGoals).filter_by(user_id=user_id, skill_id=skill_id).first()
#     if not exists:
#         user_goal = UserGoals(user_id=user_id, skill_id=skill_id)
#         session.add(user_goal)
#         session.commit()

# def add_user_skill(user_id, skill_id, fluency_level):
#     exists = session.query(UserSkills).filter_by(user_id=user_id, skill_id=skill_id).first()
#     if not exists:
#         user_skill = UserSkills(
#             user_id=user_id,
#             skill_id=skill_id,
#             fluency_level=fluency_level
#         )
#         session.add(user_skill)
#         session.commit()

# # Ensure the users exist
# user_nour = get_or_create_user('joe@gmail.com', 'Nour')
# user_tyler = get_or_create_user('hello@example.com', 'Tyler')

# # Delete all requests sent by the users
# session.query(Requests).filter_by(requester_id=user_tyler.user_id).delete()
# session.query(Requests).filter_by(requester_id=user_nour.user_id).delete()
# session.commit()

# print(user_nour.display_name)

# # Create skills for all coding languages and store them in a dictionary
# skill_objects = {}
# for lang in coding_languages:
#     skill = get_or_create_skill(lang)
#     skill_objects[lang] = skill

# # Assign goals to user_nour
# add_user_goal(user_nour.user_id, skill_objects['Python'].skill_id)
# add_user_goal(user_nour.user_id, skill_objects['JavaScript'].skill_id)
# add_user_skill(user_nour.user_id, skill_objects['Swift'].skill_id, FluencyLevel.medium)

# # Assign skills and goals to user_tyler
# add_user_skill(user_tyler.user_id, skill_objects['Python'].skill_id, FluencyLevel.advanced)
# add_user_goal(user_tyler.user_id, skill_objects['Swift'].skill_id)

# # Create other users who have the skills the user wants to learn
# user_other1 = get_or_create_user('user1@example.com', 'User One')
# user_other2 = get_or_create_user('user2@example.com', 'User Two')

# # Assign skills to other users
# add_user_skill(user_other1.user_id, skill_objects['Python'].skill_id, FluencyLevel.advanced)
# add_user_skill(user_other1.user_id, skill_objects['JavaScript'].skill_id, FluencyLevel.beginner)
# add_user_skill(user_other2.user_id, skill_objects['JavaScript'].skill_id, FluencyLevel.medium)

# # Invoke the function to find compatible users
# compatible_users = find_compatible_users_with_skills(user_nour.user_id)

# # Print the results
# print("Compatible Users for joe@gmail.com:")
# for user in compatible_users:
#     print(f"User ID: {user['user_id']}, Display Name: {user['display_name']}")
#     for skill in user['matching_skills']:
#         print(f"  Skill ID: {skill['skill_id']}, Skill Name: {skill['skill_name']}, Fluency Level: {skill['fluency_level']}")






# Close the session if necessary
# session.close()
