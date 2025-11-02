import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateContentModal } from "../components/CreateContentModal";
import { SideBar } from "../components/SideBar";
import { Button } from "../components/Button";
import { ShareIcon } from "../icons/Shareicon";
import { PlusIcon } from "../icons/PlusIcon";
import { useContent } from "../hooks/useContent";
import { Card } from "../components/card";
import { AskBrain } from "../components/AskBrain";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import { BACKEND_URL } from "../config";

export function DashBoard() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAsk, setShowAsk] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [type, setType] = useState("");

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
        {
          headers: { Authorization: token }
        }
      );

      const shareUrl = `${window.location.origin}/share/${response.data.hash}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!', { id: loadingToast, duration: 3000 });
    } catch (error) {
      toast.error('Failed to generate share link', { id: loadingToast });
      console.error('Error sharing brain:', error);
    }
  }

  // called from CreateContentModal after content is saved
  function handleContentAdded() {
    refresh();
    // let user know embedding is happening in background
    toast('Indexing for AI search...', {
      duration: 3000,
      icon: '🧠',
    });
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
        <SideBar onSelectType={handleTypeSelect} onAskBrain={() => setShowAsk(true)} />

        {/* main content - shrinks on desktop when ask panel is open */}
        <main className={`flex-1 p-4 pt-16 md:pt-4 md:ml-72 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 w-full overflow-x-hidden transition-all duration-300
          ${showAsk ? "md:mr-80" : ""}`}>

          <CreateContentModal open={isOpen} onClose={handleClose} onContentAdded={handleContentAdded} />

          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex flex-wrap gap-2 md:gap-3">
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
              {/* ask brain button in header for mobile (sidebar is hidden on mobile) */}
              <button
                onClick={() => setShowAsk(true)}
                className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium shadow-md"
              >
                🧠 Ask
              </button>
              <Button
                onClick={handleLogout}
                variant="primary"
                text="Logout"
              />
            </div>
          </div>

          <div className={`grid gap-2 grid-cols-1 sm:grid-cols-2 ${showAsk ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
            {contents
              .filter(({ type: contentType }) => !type || contentType === type)
              .map(({ type, link, title, content, _id }) => (
                <Card
                  key={_id}
                  type={type}
                  link={link}
                  title={title}
                  content={content}
                  id={_id}
                  onDelete={refresh}
                />
              ))}
          </div>
        </main>

        {/* ask brain panel */}
        {showAsk && <AskBrain onClose={() => setShowAsk(false)} />}
      </div>
    </>
  );
}
