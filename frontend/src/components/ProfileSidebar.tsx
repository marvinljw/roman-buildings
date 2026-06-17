import React from 'react';
import { Drawer, IconButton, Typography, Avatar, List, ListItem, ListItemText, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ProfileSidebarProps {
  username: string;
  visitedSites: number;
  onClose: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ username, visitedSites, onClose }) => {
  const getAchievements = (visitedCount: number) => {
    const achievements = [];
    if (visitedCount >= 1) achievements.push("Roman Explorer");
    if (visitedCount >= 3) achievements.push("History Buff");
    if (visitedCount >= 5) achievements.push("Architectural Enthusiast");
    if (visitedCount >= 10) achievements.push("Time Traveler");
    return achievements;
  };

  const achievements = getAchievements(visitedSites);

  return (
    <Drawer anchor="right" open={true} onClose={onClose}>
      <div style={{ width: 300, padding: 16 }}>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
          <Avatar
            alt={username}
            src="/profile-icon.png"
            sx={{ width: 80, height: 80, marginBottom: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            {username}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Visited Sites: {visitedSites}
          </Typography>
        </div>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Achievements
        </Typography>
        <List>
          {achievements.map((achievement, index) => (
            <ListItem key={index}>
              <ListItemText primary={achievement} />
            </ListItem>
          ))}
        </List>
        {achievements.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Visit more sites to earn achievements!
          </Typography>
        )}
      </div>
    </Drawer>
  );
};

export default ProfileSidebar;