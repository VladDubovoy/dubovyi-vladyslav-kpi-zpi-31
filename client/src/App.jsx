import { Navigate, Route, Routes } from "react-router-dom";
import { Header } from "./components/Header";
import { Toaster } from "./components/Toaster";
import { PATHS } from "./constants/views";
import { useAuth } from "./store/auth";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { ChatPage } from "./pages/ChatPage";
import { CreatePostPage } from "./pages/CreatePostPage";
import { FeedPage } from "./pages/FeedPage";
import { ReelsPage } from "./pages/ReelsPage";
import { StoriesPage } from "./pages/StoriesPage";

export function App() {
  const { user } = useAuth();

  return (
    <>
      <Header />
      <Toaster />
      <Routes>
        <Route path={PATHS.FEED} element={<FeedPage />} />
        <Route path={PATHS.STORIES} element={<StoriesPage />} />
        <Route path={PATHS.REELS} element={<ReelsPage />} />
        <Route path={PATHS.AUTH} element={<AuthPage />} />
        <Route
          path={PATHS.CHAT}
          element={user ? <ChatPage /> : <Navigate to={PATHS.AUTH} replace />}
        />
        <Route
          path={PATHS.CREATE}
          element={
            user ? <CreatePostPage /> : <Navigate to={PATHS.AUTH} replace />
          }
        />
        <Route
          path={PATHS.ADMIN}
          element={
            user?.role === "admin" ? (
              <AdminPage />
            ) : (
              <Navigate to={PATHS.FEED} replace />
            )
          }
        />
        <Route path="*" element={<Navigate to={PATHS.FEED} replace />} />
      </Routes>
    </>
  );
}
