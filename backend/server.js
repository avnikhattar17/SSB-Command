
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import Resource from './models/Resource.js';
import OfficialSite from './models/OfficialSite.js';
import InspirationProfile from './models/InspirationProfile.js';
import { resources as initialResources } from '../frontend/src/data/resources.js';
import { officialSites as initialOfficialSites } from '../frontend/src/data/officialSites.js';
import { inspirationProfiles as initialInspirationProfiles } from '../frontend/src/data/inspirationProfiles.js';

const port = Number(process.env.PORT) || 5000;

async function start() {
  await connectDB();

  await Resource.bulkWrite(
    initialResources.map((resource, order) => ({
      updateOne: {
        filter: { id: resource.id },
        update: { $set: { ...resource, order } },
        upsert: true,
      },
    }))
  );

  await OfficialSite.bulkWrite(
    initialOfficialSites.map((site, order) => ({
      updateOne: {
        filter: { id: site.id },
        update: { $set: { ...site, order } },
        upsert: true,
      },
    }))
  );

  await InspirationProfile.bulkWrite(
    initialInspirationProfiles.map((profile, order) => ({
      updateOne: {
        filter: { id: profile.id },
        update: { $set: { ...profile, order } },
        upsert: true,
      },
    }))
  );

  console.log(
    `Synced ${initialResources.length} curated resources, ${initialOfficialSites.length} official service sites, and ${initialInspirationProfiles.length} inspiration profiles with MongoDB.`
  );

  app.listen(port, () => {
    console.log(`SSB API connected to MongoDB on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Could not start the SSB API:', error);
  process.exitCode = 1;
});
