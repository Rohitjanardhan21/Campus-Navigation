// src/data/campusPlaces.ts

import { CampusPlace } from "../domain/campus";

export const CAMPUS_PLACES: CampusPlace[] = [
  // Entrances
  {
    id: "main-gate",
    name: "Main Gate",
    coordinate: [77.48, 12.94],
    type: "entrance",
    description: "Primary entrance to campus",
    hours: "24/7",
  },
  {
    id: "north-gate",
    name: "North Gate",
    coordinate: [77.481, 12.942],
    type: "entrance",
    description: "Secondary entrance near hostels",
    hours: "6:00 AM - 10:00 PM",
  },
  {
    id: "south-gate",
    name: "South Gate",
    coordinate: [77.479, 12.938],
    type: "entrance",
    description: "Service entrance",
    hours: "6:00 AM - 8:00 PM",
  },

  // Academic Buildings
  {
    id: "library",
    name: "Central Library",
    coordinate: [77.482, 12.941],
    type: "academic",
    description: "Main library with study halls and digital resources",
    hours: "8:00 AM - 10:00 PM",
    floors: 4,
  },
  {
    id: "engineering-block",
    name: "Engineering Block",
    coordinate: [77.483, 12.940],
    type: "academic",
    description: "Computer Science and Engineering departments",
    hours: "8:00 AM - 8:00 PM",
    floors: 5,
  },
  {
    id: "science-block",
    name: "Science Block",
    coordinate: [77.481, 12.943],
    type: "academic",
    description: "Physics, Chemistry, and Biology labs",
    hours: "8:00 AM - 6:00 PM",
    floors: 3,
  },
  {
    id: "admin-building",
    name: "Administration Building",
    coordinate: [77.479, 12.941],
    type: "admin",
    description: "Registrar, Admissions, and Finance offices",
    hours: "9:00 AM - 5:00 PM",
    floors: 2,
  },
  {
    id: "lecture-hall-1",
    name: "Lecture Hall Complex 1",
    coordinate: [77.484, 12.939],
    type: "academic",
    description: "Large lecture halls and seminar rooms",
    hours: "8:00 AM - 8:00 PM",
    floors: 2,
  },
  {
    id: "lecture-hall-2",
    name: "Lecture Hall Complex 2",
    coordinate: [77.478, 12.939],
    type: "academic",
    description: "Additional lecture halls and classrooms",
    hours: "8:00 AM - 8:00 PM",
    floors: 2,
  },

  // Food & Dining
  {
    id: "canteen",
    name: "Main Canteen",
    coordinate: [77.479, 12.938],
    type: "food",
    description: "Primary dining facility with variety of cuisines",
    hours: "7:00 AM - 9:00 PM",
  },
  {
    id: "food-court",
    name: "Food Court",
    coordinate: [77.482, 12.938],
    type: "food",
    description: "Multiple food stalls and quick bites",
    hours: "10:00 AM - 10:00 PM",
  },
  {
    id: "coffee-shop",
    name: "Campus Coffee Shop",
    coordinate: [77.483, 12.941],
    type: "food",
    description: "Coffee, snacks, and study space",
    hours: "7:00 AM - 11:00 PM",
  },

  // Hostels
  {
    id: "boys-hostel-1",
    name: "Boys Hostel Block A",
    coordinate: [77.485, 12.944],
    type: "hostel",
    description: "Accommodation for male students",
    hours: "24/7",
    floors: 4,
  },
  {
    id: "boys-hostel-2",
    name: "Boys Hostel Block B",
    coordinate: [77.486, 12.943],
    type: "hostel",
    description: "Additional accommodation for male students",
    hours: "24/7",
    floors: 4,
  },
  {
    id: "girls-hostel-1",
    name: "Girls Hostel Block A",
    coordinate: [77.484, 12.945],
    type: "hostel",
    description: "Accommodation for female students",
    hours: "24/7",
    floors: 4,
  },
  {
    id: "girls-hostel-2",
    name: "Girls Hostel Block B",
    coordinate: [77.485, 12.946],
    type: "hostel",
    description: "Additional accommodation for female students",
    hours: "24/7",
    floors: 4,
  },

  // Sports & Recreation
  {
    id: "sports-complex",
    name: "Sports Complex",
    coordinate: [77.477, 12.942],
    type: "sports",
    description: "Indoor sports facilities and gymnasium",
    hours: "6:00 AM - 10:00 PM",
  },
  {
    id: "football-ground",
    name: "Football Ground",
    coordinate: [77.476, 12.941],
    type: "sports",
    description: "Main football field and track",
    hours: "6:00 AM - 8:00 PM",
  },
  {
    id: "basketball-court",
    name: "Basketball Courts",
    coordinate: [77.477, 12.943],
    type: "sports",
    description: "Outdoor basketball courts",
    hours: "6:00 AM - 10:00 PM",
  },

  // Medical & Services
  {
    id: "medical-center",
    name: "Medical Center",
    coordinate: [77.480, 12.942],
    type: "medical",
    description: "Campus health center and pharmacy",
    hours: "8:00 AM - 8:00 PM",
  },
  {
    id: "bank-atm",
    name: "Bank & ATM",
    coordinate: [77.479, 12.940],
    type: "services",
    description: "Banking services and ATM facility",
    hours: "10:00 AM - 4:00 PM",
  },
  {
    id: "post-office",
    name: "Post Office",
    coordinate: [77.480, 12.941],
    type: "services",
    description: "Campus postal services",
    hours: "9:00 AM - 5:00 PM",
  },

  // Parking
  {
    id: "main-parking",
    name: "Main Parking Area",
    coordinate: [77.478, 12.940],
    type: "parking",
    description: "Primary vehicle parking facility",
    hours: "24/7",
  },
  {
    id: "hostel-parking",
    name: "Hostel Parking",
    coordinate: [77.485, 12.944],
    type: "parking",
    description: "Parking area near hostels",
    hours: "24/7",
  },

  // Gardens & Landmarks
  {
    id: "central-garden",
    name: "Central Garden",
    coordinate: [77.481, 12.940],
    type: "garden",
    description: "Beautiful landscaped garden for relaxation",
    hours: "24/7",
  },
  {
    id: "auditorium",
    name: "Main Auditorium",
    coordinate: [77.482, 12.939],
    type: "landmark",
    description: "Large auditorium for events and ceremonies",
    hours: "Event-based",
  },
];
