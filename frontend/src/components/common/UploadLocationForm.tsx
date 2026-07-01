import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface UploadLocationFormProps {
  onLocationSubmit: (location: {
    name: string;
    latitude: number;
    longitude: number;
    description: string;
    imageUrl: string;
    yearBuilt: number;
    country: string;
  }) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}

const UploadLocationForm: React.FC<UploadLocationFormProps> = ({ onLocationSubmit, initialLatitude, initialLongitude }) => {
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState(initialLatitude ? initialLatitude.toString() : '');
  const [longitude, setLongitude] = useState(initialLongitude ? initialLongitude.toString() : '');
  const [description, setDescription] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [country, setCountry] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update latitude and longitude when initialLatitude or initialLongitude change
  React.useEffect(() => {
    if (initialLatitude !== undefined) {
      setLatitude(initialLatitude.toString());
    }
    if (initialLongitude !== undefined) {
      setLongitude(initialLongitude.toString());
    }
  }, [initialLatitude, initialLongitude]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (image) {
      setIsLoading(true);
      try {
        const imageUrl = await uploadImage(image);
        onLocationSubmit({
          name,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          description,
          imageUrl,
          yearBuilt: parseInt(yearBuilt),
          country,
        });
        // Reset form fields
        setName('');
        setLatitude('');
        setLongitude('');
        setDescription('');
        setYearBuilt('');
        setCountry('');
        setImage(null);
      } catch (error) {
        console.error('Error uploading image:', error);
        // Handle error (e.g., show error message to user)
      } finally {
        setIsLoading(false);
      }
    }
  };

  const uploadImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Simulate an API call to upload the image
        setTimeout(() => {
          // In a real application, you would send the file to your server here
          // and get back a URL for the uploaded image.
          // For now, we'll just resolve with the data URL
          resolve(reader.result as string);
        }, 1500); // Simulate a delay
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Add New Location
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="name"
              label="Location Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              fullWidth
              id="latitude"
              label="Latitude"
              type="number"
              inputProps={{ step: "any" }}
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              fullWidth
              id="longitude"
              label="Longitude"
              type="number"
              inputProps={{ step: "any" }}
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              id="description"
              label="Description"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              fullWidth
              id="yearBuilt"
              label="Year Built"
              type="number"
              value={yearBuilt}
              onChange={(e) => setYearBuilt(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              fullWidth
              id="country"
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
            />
            <label htmlFor="raised-button-file">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={image ? <CheckCircleIcon color="success" /> : <CloudUploadIcon />}
                sx={{ p: 1.5 }}
              >
                {image ? 'Image Selected' : 'Upload Image'}
              </Button>
            </label>
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={isLoading}
              sx={{ mt: 2 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Add Location'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default UploadLocationForm;