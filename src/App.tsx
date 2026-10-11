import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GameProvider, useGame } from './state/GameContext';
import { Layout } from './components/Layout';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { QuizPage } from './pages/Quiz';
import { ExamPage } from './pages/Exam';
import { PartyPage } from './pages/Party';
import { DuelPage } from './pages/Duel';
import { KahootPage } from './pages/Kahoot';
import { ArcadePage } from './pages/Arcade';
import { ChallengesPage } from './pages/Challenges';
import { BadgesPage } from './pages/Badges';
import { GradesPage } from './pages/Grades';
import { LeaderboardPage } from './pages/Leaderboard';
import { FriendsPage } from './pages/Friends';
import { CreatorPage } from './pages/Creator';
import { ProfilePage } from './pages/Profile';
import { RevisionPage } from './pages/Revision';

/** Un profil est "configure" des que l'enfant a saisi son prenom. */
const isConfigured = (save: ReturnType<typeof useGame>['save']) =>
  save.profile.name !== 'Ninja' || save.stats.questionsAnswered > 0 || save.history.length > 0 || save.profile.ryos > 0;

const Shell: React.FC = () => {
  const { save } = useGame();
  if (!isConfigured(save)) return <Onboarding />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/examen" element={<ExamPage />} />
        <Route path="/party" element={<PartyPage />} />
        <Route path="/duel" element={<DuelPage />} />
        <Route path="/kahoot" element={<KahootPage />} />
        <Route path="/arcade" element={<ArcadePage />} />
        <Route path="/defis" element={<ChallengesPage />} />
        <Route path="/badges" element={<BadgesPage />} />
        <Route path="/grades" element={<GradesPage />} />
        <Route path="/classement" element={<LeaderboardPage />} />
        <Route path="/amis" element={<FriendsPage />} />
        <Route path="/creer" element={<CreatorPage />} />
        <Route path="/revision" element={<RevisionPage />} />
        <Route path="/profil" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export const App: React.FC = () => (
  <BrowserRouter>
    <GameProvider>
      <Shell />
    </GameProvider>
  </BrowserRouter>
);

export default App;
