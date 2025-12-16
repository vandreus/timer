import { Worksite, Project } from '../models/index.js';
import { Client } from '@googlemaps/google-maps-services-js';
import env from '../config/env.js';
import { getWorksitesWithDistances } from '../utils/geolocation.js';

const mapsClient = new Client({});

export const getAllWorksites = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;

    const worksites = await Worksite.findAll({
      include: [
        { 
          association: 'projects',
          where: { isActive: true },
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // If coordinates provided, include distances
    if (lat && lon) {
      const worksitesWithDistances = getWorksitesWithDistances(
        parseFloat(lat),
        parseFloat(lon),
        worksites
      );
      return res.json({ worksites: worksitesWithDistances });
    }

    res.json({ worksites });
  } catch (error) {
    next(error);
  }
};

export const createWorksite = async (req, res, next) => {
  try {
    const { name, address } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required' });
    }

    // Geocode address using Google Maps API
    let latitude, longitude;
    
    if (env.googleMaps.apiKey) {
      try {
        const response = await mapsClient.geocode({
          params: {
            address,
            key: env.googleMaps.apiKey,
          },
        });

        if (response.data.results.length > 0) {
          const location = response.data.results[0].geometry.location;
          latitude = location.lat;
          longitude = location.lng;
        } else {
          return res.status(400).json({ error: 'Address not found' });
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        return res.status(400).json({ error: 'Failed to geocode address' });
      }
    } else {
      // Fallback: require manual coordinates if no API key
      latitude = req.body.latitude;
      longitude = req.body.longitude;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ 
          error: 'Coordinates required (Google Maps API key not configured)' 
        });
      }
    }

    const worksite = await Worksite.create({
      name,
      address,
      latitude,
      longitude,
      createdBy: req.userId,
    });

    res.status(201).json({ worksite });
  } catch (error) {
    next(error);
  }
};

export const updateWorksite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

    const worksite = await Worksite.findByPk(id);

    if (!worksite) {
      return res.status(404).json({ error: 'Worksite not found' });
    }

    if (name) worksite.name = name;

    // If address changed, re-geocode
    if (address && address !== worksite.address) {
      if (env.googleMaps.apiKey) {
        try {
          const response = await mapsClient.geocode({
            params: {
              address,
              key: env.googleMaps.apiKey,
            },
          });

          if (response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            worksite.address = address;
            worksite.latitude = location.lat;
            worksite.longitude = location.lng;
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          return res.status(400).json({ error: 'Failed to geocode address' });
        }
      }
    }

    await worksite.save();

    res.json({ worksite });
  } catch (error) {
    next(error);
  }
};

export const deleteWorksite = async (req, res, next) => {
  try {
    const { id } = req.params;

    const worksite = await Worksite.findByPk(id);

    if (!worksite) {
      return res.status(404).json({ error: 'Worksite not found' });
    }

    await worksite.destroy();

    res.json({ message: 'Worksite deleted successfully' });
  } catch (error) {
    next(error);
  }
};
