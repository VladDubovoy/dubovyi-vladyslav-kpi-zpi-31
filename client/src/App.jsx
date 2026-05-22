import { useState } from "react";
import { Header } from "./components/Header";
import { VIEWS } from "./constants/views";
import { useAuth } from "./store/auth";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { ChatPage } from "./pages/ChatPage";
import { CreatePostPage } from "./pages/CreatePostPage";
import { FeedPage } from "./pages/FeedPage";
import { ReelsPage } from "./pages/ReelsPage";
import { StoriesPage } from "./pages/StoriesPage";

export function App() {
  const [view, setView] = useState(VIEWS.FEED);
  const { user } = useAuth();

  return (
    <>
      <Header view={view} onViewChange={setView} />

      {view === VIEWS.FEED && <FeedPage />}
      {view === VIEWS.STORIES && <StoriesPage />}
      {view === VIEWS.REELS && <ReelsPage />}
      {view === VIEWS.CHAT && user && <ChatPage />}
      {view === VIEWS.AUTH && <AuthPage onViewChange={setView} />}
      {view === VIEWS.CREATE && user && (
        <CreatePostPage onViewChange={setView} />
      )}
      {view === VIEWS.ADMIN && user?.role === "admin" && <AdminPage />}
    </>
  );
}
