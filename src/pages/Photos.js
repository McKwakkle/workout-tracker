import {useState, useEffect, useRef} from 'react';
import StorageService from '../services/StorageService';

function Photos() {
  const [photos, setPhotos] = useState([]);
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [photoDate, setPhotoDate] = useState(
    new Date().toISOString().split('T')[0]
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

  
}