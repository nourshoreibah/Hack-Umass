import { Stack, useRouter } from 'expo-router';
import { AuthProvider, AuthContext } from '../contexts/AuthContext';
import React, { useEffect, useContext } from 'react';
import Tile from './tile';
import SkillsSelection from './tabs/SkillsSelection';

export default function RootLayout() {




  const CodingLanguage = {
    JAVASCRIPT: "JavaScript",
    PYTHON: "Python",
    JAVA: "Java",
    CSHARP: "C#",
    CCPP: "C/C++",
    PHP: "PHP",
    R: "R",
    TYPESCRIPT: "TypeScript",
    SWIFT: "Swift",
    GOLANG: "Go (Golang)",
    RUBY: "Ruby",
    MATLAB: "MATLAB",
    KOTLIN: "Kotlin",
    RUST: "Rust",
    PERL: "Perl",
    SCALA: "Scala",
    DART: "Dart",
    LUA: "Lua",
    OBJECTIVE_C: "Objective-C",
    SHELL: "Shell (Bash)"
  };

  return (
    <AuthProvider>
      <Main />
      <SkillsSelection languages={CodingLanguage}/>
    </AuthProvider>
  );
}

function Main() {
  const { authToken } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (authToken) {
      router.replace('/tabs/home');
    } else {
      router.replace('/login');
    }
  }, [authToken]);

  return (
    <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack>
  );
}

