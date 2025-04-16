import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../components/card';

export function SharedContent() {
  const { hash } = useParams();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        const response = await axios.get(
          `https://second-brain-0z65.onrender.com/api/v1/brain/share/${hash}`
        );
        setContents(response.data.content);
        setLoading(false);
      } catch (error) {
        setError('Failed to load shared content'+error);
        setLoading(false);
      }
    };

    fetchSharedContent();
  }, [hash]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Shared Content</h1>
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
  );
}