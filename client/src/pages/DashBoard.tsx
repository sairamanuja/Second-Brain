import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateContentModal } from "../components/CreateContentModal";
import { SideBar } from "../components/SideBar";
import { Button } from "../components/Button";
import { ShareIcon } from "../icons/Shareicon";
import { PlusIcon } from "../icons/PlusIcon";
import { useContent } from "../hooks/useContent";
import { Card } from "../components/card";

export function DashBoard() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/signin");
    }
  }, [token, navigate]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const { contents, refresh } = useContent();

  useEffect(() => {
    refresh();
  }, [!isOpen]);

  if (!token) {
    return null;
  }

  return (
    <div className="">
      <SideBar />
      <div className="p-4 ml-72 min-h-screen bg-gray-100">
        <CreateContentModal open={isOpen} onClose={handleClose} />
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
            startIcon={<ShareIcon />}
            text="Share Brain"
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          {contents.map(({ type, link, title, content, _id }) => (
            <Card
              key={_id}
              type={type}
              link={link}
              title={title}
              content={content}
              id={_id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}