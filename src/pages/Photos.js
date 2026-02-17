import { useState, useEffect, useRef } from 'react';
import StorageService from '../services/StorageService';

function Photos() {
  const [photos, setPhotos] = useState([]);
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [photoDate, setPhotoDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [preview, setPreview] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [comparePhotos, setComparePhotos] = useState([null, null]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = () => {
    const allPhotos = StorageService.getAllPhotos();
    allPhotos.sort((a, b) => new Date(b.date) - new Date(a.date));
    setPhotos(allPhotos);
  };
  // Setting up image compression
  // Doing it for local development
  // Might keep it in for later
  const compressImage = (file, maxSizeMB, callback) => {
    const maxSize = maxSizeMB * 1024 * 1024;
    const img = new Image();
    const reader = new FileReader();

    reader.onloadend = () => {
      if (file.size <= maxSize) {
        callback(reader.result);
        return;
      }
      img.onload = () => {
        const canvas = document.createElement('canvas');

        let width = img.width;
        let height = img.height;
        const scaleFactor = Math.sqrt(maxSize / file.size);
        width = Math.round(width * scaleFactor);
        height = Math.round(height * scaleFactor);

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.8;
        let result = canvas.toDataURL('image/jpeg', quality);

        while (result.length > maxSize * 1.37 && quality > 0.1 ) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
        }

        callback(result);
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  };

  // Development: compresses to 2MB for localStorage
  // Increase this limit when migrated to PHP/Firebase backend
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    compressImage(file, 2, (compressedImage) => {
      setPreview(compressImage);
      setSaveMessage('');
    });
  };

  const savePhoto = () => {
    if (!preview) {
      setSaveMessage('Please select a photo first');
      return;
    }

    StorageService.savePhoto({
      date: photoDate,
      image: preview,
      tags: tags,
      notes: notes,
    });

    setPreview(null);
    setTags('');
    setNotes('');
    setPhotoDate(new Date().toISOString().split('T')[0]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setSaveMessage('Photo saved successfully');
    setTimeout(() => setSaveMessage(''), 3000);
    loadPhotos();
  };

  const deletePhoto = (photoId) => {
    if (window.confirm('Are you sure want to delete this photo?')) {
      StorageService.deletePhoto(photoId);
      loadPhotos();
      setComparePhotos((prev) =>
      prev.map((p) => (p && p.id === photoId ? null : p))
      );
    }
  };

}

export default Photos;
