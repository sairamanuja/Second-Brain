import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card } from '../components/card';
import { BACKEND_URL } from '../config';

export function SharedContent() {
  const { hash } = useParams();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/v1/brain/share/${hash}`
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
    <div className="p-4 md:p-6 min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Shared Content</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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