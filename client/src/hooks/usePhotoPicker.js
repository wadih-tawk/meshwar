import { useEffect, useState } from 'react';
import { checkPhotoFile } from '../utils/photos.js';

export function usePhotoPicker() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [problem, setProblem] = useState('');

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function pick(e) {
    const chosen = e.target.files[0];
    e.target.value = '';
    if (!chosen) {
      return;
    }
    const message = checkPhotoFile(chosen);
    setProblem(message);
    if (message) {
      return;
    }
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
  }

  function clear() {
    setFile(null);
    setPreview(null);
    setProblem('');
  }

  return { file, preview, problem, pick, clear };
}
