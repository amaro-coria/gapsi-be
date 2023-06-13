const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 4000;
const DATABASE_PATH = './bd.json';
const PAGE_SIZE = 10;

// Middleware for parsing JSON data
app.use(express.json());
app.use(cors());

// Read the providers from the JSON file
function readProviders() {
  const data = fs.readFileSync(DATABASE_PATH);
  return JSON.parse(data);
}

// Write the providers to the JSON file
function writeProviders(providers) {
  const data = JSON.stringify(providers, null, 2);
  fs.writeFileSync(DATABASE_PATH, data);
}

// Generate a GET endpont that returns a generic welcome message
app.get('/welcome', (req, res) => {
    res.status(200).json({ text: 'Welcome to the Providers API, Mr Anderson' });
    });

// Generate a GET endpoint that returns the version of the API
app.get('/version', (req, res) => {
    res.status(200).json({ value: '1.0.0' });
    });

// Get a paginated list of providers
app.get('/providers', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;

  const providers = readProviders();
  const paginatedProviders = providers.slice(startIndex, endIndex);

  res.json({
    page,
    pageSize: PAGE_SIZE,
    totalProviders: providers.length,
    providers: paginatedProviders,
  });
});

// Add a new provider
app.post('/providers', (req, res) => {
  const { name, alias, address } = req.body;

  if (!name || !alias || !address) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const providers = readProviders();

  // Check for duplicate name
  const duplicateProvider = providers.find(
    (provider) => provider.name === name
  );
  if (duplicateProvider) {
    return res.status(409).json({ error: 'Provider already exists' });
  }

  const newProvider = {
    id: Date.now().toString(),
    name,
    alias,
    address,
  };

  providers.push(newProvider);
  writeProviders(providers);

  res.status(201).json(newProvider);
});

// Delete a provider
app.delete('/providers/:id', (req, res) => {
    const providerId = req.params.id;
  
    const providers = readProviders();
  
    // Find the index of the provider with the given ID
    const providerIndex = providers.findIndex(
      (provider) => provider.id === providerId
    );
  
    if (providerIndex === -1) {
      return res.status(404).json({ error: 'Provider not found' });
    }
  
    // Remove the provider from the array
    providers.splice(providerIndex, 1);
  
    writeProviders(providers);
  
    res.status(200).json({ message: 'Provider deleted successfully' });
  });
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
