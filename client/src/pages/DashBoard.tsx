import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateContentModal } from "../components/CreateContentModal";
import { SideBar } from "../components/SideBar";
import { Button } from "../components/Button";
import { ShareIcon } from "../icons/Shareicon";
import { PlusIcon } from "../icons/PlusIcon";
import { Bars3Icon as MenuIcon } from "@heroicons/react/24/outline";
import { useContent } from "../hooks/useContent";
import { Card } from "../components/card";
import { AskBrain } from "../components/AskBrain";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import { BACKEND_URL } from "../config";

export function DashBoard() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAsk, setShowAsk] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [type, setType] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    if (!token) navigate("/signin");
  }, [token, navigate]);

  const { contents, refresh } = useContent();

  const handleTypeSelect = (selectedType: string) => {
    setType(selectedType);
  };

  const handleClose = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success('Logged out successfully');
    setTimeout(() => navigate("/signin"), 1000);
  };

  async function ShareBrain() {
    const loadingToast = toast.loading('Generating share link...');
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/brain/share`,
        { share: true },
        { headers: { Authorization: token } }
      );
      const shareUrl = `${window.location.origin}/share/${response.data.hash}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!', { id: loadingToast, duration: 3000 });
    } catch (error) {
      toast.error('Failed to generate share link', { id: loadingToast });
      console.error('Error sharing brain:', error);
    }
  }

  function handleContentAdded() {
    refresh();
    toast('Indexing for AI search...', { duration: 3000, icon: '🧠' });
  }

  if (!token) return null;

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} toastOptions={{
        success: { duration: 3000, iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error: { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        loading: { iconTheme: { primary: '#3b82f6', secondary: '#fff' } },
      }} />

      <div className="flex min-h-screen">
        <SideBar
          onSelectType={handleTypeSelect}
          onAskBrain={() => setShowAsk(true)}
          desktopOpen={sidebarOpen}
          onDesktopToggle={() => setSidebarOpen(v => !v)}
        />

        {/* everything right of the sidebar — margin collapses when sidebar is closed */}
        <div className={`flex flex-1 min-h-screen overflow-hidden transition-all duration-300 ${sidebarOpen ? "md:ml-72" : "md:ml-0"}`}>

          {/* main content scrolls independently */}
          <main className="flex-1 p-4 pt-16 md:pt-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-y-auto min-h-screen">

            <CreateContentModal open={isOpen} onClose={handleClose} onContentAdded={handleContentAdded} />

            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex flex-wrap gap-2 md:gap-3 items-center">
                {/* desktop sidebar toggle — only visible when sidebar is closed */}
                {!sidebarOpen && (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="hidden md:flex p-2 rounded-lg hover:bg-purple-100 text-gray-600 transition-all"
                  >
                    <MenuIcon className="h-5 w-5" />
                  </button>
                )}
                <Button
                  onClick={() => setIsOpen(true)}
                  variant="primary"
                  startIcon={<PlusIcon />}
                  text="Add Content"
                />
                <Button
                  onClick={ShareBrain}
                  variant="secondary"
                  startIcon={<ShareIcon />}
                  text="Share Brain"
                />
              </div>
              <div className="flex gap-2 items-center">
                {/* ask brain button in header — visible on mobile (sidebar hidden) and desktop */}
                <button
                  onClick={() => setShowAsk(v => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium shadow-md"
                >
                  🧠 Ask
                </button>
                <Button onClick={handleLogout} variant="primary" text="Logout" />
              </div>
            </div>

            {selectedTag && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500">Filtered by:</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                  {selectedTag}
                </span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  clear
                </button>
              </div>
            )}

            <div className={`grid gap-3 grid-cols-1 sm:grid-cols-2 ${showAsk ? "xl:grid-cols-2" : "lg:grid-cols-3"}`}>
              {contents
                .filter(({ type: contentType }) => !type || contentType === type)
                .filter((c: any) => !selectedTag || c.tags?.includes(selectedTag))
                .map(({ type, link, title, content, _id, summary, tags }: any) => (
                  <Card
                    key={_id}
                    type={type}
                    link={link}
                    title={title}
                    content={content}
                    id={_id}
                    summary={summary}
                    tags={tags}
                    onTagClick={setSelectedTag}
                    onDelete={refresh}
                  />
                ))}
            </div>
          </main>

          {/* ask brain panel — inline on desktop, overlay on mobile */}
          {showAsk && <AskBrain onClose={() => setShowAsk(false)} />}
        </div>
      </div>
    </>
  );
}
