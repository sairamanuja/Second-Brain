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
import { BACKEND_URL } from "../config";

export function DashBoard() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [type, setType] = useState(""); // Initialize with a default type

  useEffect(() => {
    if (!token) {
      navigate("/signin");
    }
  }, [token, navigate]);

  const handleTypeSelect = (selectedType: string) => {
    setType(selectedType); // Update the type state
  };

  async function ShareBrain() {
    const response = await axios.post(`${BACKEND_URL}/api/v1/brain/share`, {
      share: true
    }, {
      headers: {
        "Authorization": localStorage.getItem("token") // Passing the authorization token in the request header
      }
    });

    const shareUrl = `http://localhost:5173/share/${response.data.hash}`;
    alert(shareUrl);
  }

  const handleClose = () => {
    setIsOpen(false);
  };

  const { contents, refresh } = useContent();

  if (!token) {
    return null;
  }

  return (
    <div className="">
      <SideBar onSelectType={handleTypeSelect} />
      <div className="p-4 ml-72 min-h-screen bg-gray-100">
        <CreateContentModal open={isOpen} onClose={handleClose} onContentAdded={refresh} />
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => {
              setIsOpen(true);
            }}
            variant="primary"
            startIcon={<PlusIcon />}
            text="Add content"
          />
          <Button
            variant="secondary"
            onClick={ShareBrain}
            startIcon={<ShareIcon />}
            text="Share Brain"
          />
        </div>
        <div className="flex gap-4 flex-wrap">
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
      </div>
    </div>
  );
}