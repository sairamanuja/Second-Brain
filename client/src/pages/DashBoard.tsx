import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateContentModal } from "../components/CreateContentModal";
import { SideBar } from "../components/SideBar";
import { Button } from "../components/Button";
import { ShareIcon } from "../icons/Shareicon";
import { PlusIcon } from "../icons/PlusIcon";
import { useContent } from "../hooks/useContent";
import { Card } from "../components/card";
import axios from "axios";

export function DashBoard() {
  const [isOpen, setIsOpen] = useState(false);
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
    navigate("/signin");
  };

  async function ShareBrain() {
    try {
      const response = await axios.post(
        `https://second-brain-0z65.onrender.com/api/v1/brain/share`,
        { share: true },
        {
          headers: { Authorization: token }
        }
      );

      const shareUrl = `${window.location.origin}/share/${response.data.hash}`;
      const tempInput = document.createElement('input');
      tempInput.value = shareUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);

      alert('Share link copied to clipboard: ' + shareUrl);
    } catch (error) {
      alert('Failed to generate share link');
      console.error('Error sharing brain:', error);
    }
  }

  if (!token) return null;

  return (
    <div className="flex">
      <SideBar onSelectType={handleTypeSelect} />
      <main className="flex-1 p-4 md:ml-72 min-h-screen bg-gray-100">
        <CreateContentModal open={isOpen} onClose={handleClose} onContentAdded={refresh} />
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex gap-3">
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
          <Button
            onClick={handleLogout}
            variant="primary"
            text="Logout"
          />
        </div>

        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
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
    </div>
  );
}
