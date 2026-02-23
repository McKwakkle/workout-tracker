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

        while (result.length > maxSize * 1.37 && quality > 0.1) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
        }

        callback(result);
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  };

  // Development: compress to 2MB for localStorage
  // Increase this limit when migrated to PHP/Firebase backend
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    compressImage(file, 2, (compressedImage) => {
      setPreview(compressedImage);
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
    if (window.confirm('Are you sure you want to delete this photo?')) {
      StorageService.deletePhoto(photoId);
      loadPhotos();
      setComparePhotos((prev) =>
        prev.map((p) => (p && p.id === photoId ? null : p)),
      );
    }
  };

  const toggleCompare = (photo) => {
    setComparePhotos((prev) => {
      if (prev[0] && prev[0].id === photo.id) {
        return [null, prev[1]];
      }
      if (prev[1] && prev[1].id === photo.id) {
        return [prev[0], null];
      }
      if (!prev[0]) return [photo, prev[1]];
      if (!prev[1]) return [prev[0], photo];
      return [photo, prev[1]];
    });
  };

  const getCompareSlot = (photoId) => {
    if (comparePhotos[0] && comparePhotos[0].id === photoId) return 1;
    if (comparePhotos[1] && comparePhotos[1].id === photoId) return 2;
    return 0;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="photos-page">
      <h2>Progress Photos</h2>

      {/*Upload Section*/}
      <div className="photo-upload-section">
        <h3>Upload Photo</h3>
        <div className="upload-form">
          <div className="upload-left">
            <div
              className="upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              {preview ? (
                <img src={preview} alt="Preview" className="upload-preview" />
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon"><i className="fa-solid fa-camera"></i></span>
                  <p>Click to select a photo</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          <div className="upload-right">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={photoDate}
                onChange={(e) => setPhotoDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                placeholder="e.g. chest day, week 4, front pose"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                placeholder="Any notes about this photo"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button className="btn-save-photo" onClick={savePhoto}>
              Save Photo
            </button>
          </div>
        </div>

        {saveMessage && (
          <p
            className={
              saveMessage.includes('success') ? 'success-msg' : 'error-msg'
            }
          >
            {saveMessage}
          </p>
        )}
      </div>

      {/*Comparison Toggle*/}
      {photos.length >= 2 && (
        <div className="compare-toggle">
          <button
            className={`btn-compare-toggle ${compareMode ? 'active' : ''}`}
            onClick={() => {
              setCompareMode(!compareMode);
              setComparePhotos([null, null]);
            }}
          >
            {compareMode
              ? 'Exit Comparison Mode'
              : 'Compare Photos Side by Side'}
          </button>
        </div>
      )}

      {/*Comparison View*/}
      {compareMode && (
        <div className="comparison-view">
          <h3>Side by Side Comparison</h3>
          <p className="compare-instruction">
            Select two photos from the gallery below to compare them.
          </p>
          <div className="comparison-panels">
            <div className="compare-panel">
              {comparePhotos[0] ? (
                <>
                  <img
                    src={comparePhotos[0].image}
                    alt="Compare 1"
                    className="compare-photo"
                  />
                  <p className="compare-date">
                    {formatDate(comparePhotos[0].date)}
                  </p>
                  {comparePhotos[0].tags && (
                    <p className="compare-tags">{comparePhotos[0].tags}</p>
                  )}
                </>
              ) : (
                <div className="compare-empty">
                  <p>Select photo 1</p>
                </div>
              )}
            </div>

            <div className="compare-panel">
              {comparePhotos[1] ? (
                <>
                  <img
                    src={comparePhotos[1].image}
                    alt="Compare 2"
                    className="compare-photo"
                  />
                  <p className="compare-date">
                    {formatDate(comparePhotos[1].date)}
                  </p>
                  {comparePhotos[1].tags && (
                    <p className="compare-tags">{comparePhotos[1].tags}</p>
                  )}
                </>
              ) : (
                <div className="compare-empty">
                  <p>Select photo 2</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/*Photo Gallery*/}
      <div className="photo-gallery">
        <h3>Gallery</h3>
        {photos.length === 0 ? (
          <div className="empty-state">
            <p>No photos yet. Upload your first progress photo above!</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {photos.map((photo) => {
              const compareSlot = compareMode ? getCompareSlot(photo.id) : 0;

              return (
                <div
                  className={`gallery-card ${compareMode ? 'selectable' : ''} ${compareSlot > 0 ? 'selected' : ''}`}
                  key={photo.id}
                  onClick={() => compareMode && toggleCompare(photo)}
                >
                  {compareSlot > 0 && (
                    <div className="compare-badge">{compareSlot}</div>
                  )}
                  <img
                    src={photo.image}
                    alt="Progress"
                    className="gallery-photo"
                  />
                  <div className="gallery-info">
                    <span className="gallery-date">
                      {formatDate(photo.date)}
                    </span>
                    {photo.tags && (
                      <span className="gallery-tags">{photo.tags}</span>
                    )}
                    {photo.notes && (
                      <p className="gallery-notes">{photo.notes}</p>
                    )}
                  </div>
                  {!compareMode && (
                    <button
                      className="btn-delete-photo"
                      onClick={() => deletePhoto(photo.id)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Photos;
