import http from 'http';
import fs from 'fs/promises';
import { addBreeds, readBreeds, getBreadByName } from './breedService.js';
import { addCat, readCats, findCatById, editCat, deleteCate } from './catService.js';

//request listener
const server = http.createServer(async (req, res) => {

    // Post requests
    if (req.method === 'POST' && req.url === '/cats/add-cat') {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk
        });

        req.on('end', async () => {
            const formData = new URLSearchParams(body);

            const newCat = {
                imageUrl: formData.get('imageUrl'),
                name: formData.get('name'),
                description: formData.get('description'),
                breed: formData.get('breed')
            };

            addCat(newCat);
        });

        res.writeHead(302, { Location: '/' });

        return res.end();
    };

    if (req.method === 'POST' && req.url.startsWith('/cats/edit-cat')) {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk
        });

        req.on('end', async () => {
            const catId = req.url.split('/').pop();
            const formData = new URLSearchParams(body);

            const editedCat = {
                imageUrl: formData.get('imageUrl'),
                name: formData.get('name'),
                description: formData.get('description'),
                breed: formData.get('breed')
            };

            editCat(catId, editedCat);
        });

        res.writeHead(302, { Location: '/'});
        
        return res.end();
    };

    if (req.method === 'POST' && req.url.startsWith('/cats/new-home')) {
        const catId = req.url.split('/').pop();

        deleteCate(catId);

        res.writeHead(302, { Location: '/'});
        
        return res.end();
    }

    if (req.method === 'POST' && req.url === '/cats/add-breed') {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk
        });

        req.on('end', async () => {
            const formData = new URLSearchParams(body);
            const breedName = formData.get('breed');
            addBreeds(breedName);
        });

        //redirect to the home page after adding a breed
        res.writeHead(302, { Location: '/' });

        return res.end();
    };

    if (req.url === '/styles/site.css') {
        const cssContent = await fs.readFile('./src/styles/site.css', 'utf-8');

        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.write(cssContent);
        return res.end();
    };

    let htmlContent = '';
    res.writeHead(200, { 'Content-Type': 'text/html' });

    // Get requests
    if (req.url === '/') {
        htmlContent = await renderHomePage();
    } else if (req.url.startsWith('/search')) {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const name = urlParams.get('name');
        htmlContent = await renderHomePage({ name });
    } else if (req.url === '/cats/add-breed') {
        htmlContent = await fs.readFile('./src/views/addBreed.html', 'utf-8');
    } else if (req.url === '/cats/add-cat') {
        htmlContent = await renderAddCatPage();
    } else if (req.url.startsWith('/cats/edit-cat')) {
        const catId = req.url.split('/').pop();
        htmlContent = await renderEditCatPage(catId);
    } else if (req.url.startsWith('/cats/new-home')) {
        const catId = req.url.split('/').pop();
        htmlContent = await renderCatShelterPage(catId);
    }
        else {
        htmlContent = await renderPageNotFound();
    };

    res.write(htmlContent);
    res.end();
});

server.listen(5000, () => console.log('Server running on http://localhost:5000...'));

async function renderHomePage(filter = {}) {
    const htmlContent = await fs.readFile('./src/views/home/index.html', 'utf-8');

    const catTemplate = (cat) => `
                <li>
                    <img src="${cat.imageUrl}" alt="${cat.name}">
                    <h3>${cat.name}</h3>
                    <p><span>Breed: </span>${cat.breed}</p>
                    <p><span>Description: </span>${cat.description}</p>
                    <ul class="buttons">
                        <li class="btn edit"><a href="/cats/edit-cat/${cat.id}">Change Info</a></li>
                        <li class="btn delete"><a href="/cats/new-home/${cat.id}">New Home</a></li>
                    </ul>
                </li>
        `;

    const cats = readCats(filter);

    const catsContent = `<ul>${cats.map(cat => catTemplate(cat)).join('\n')}</ul>`

    const result = htmlContent.replace('{{cats}}', catsContent);

    return result;

}

async function renderAddCatPage() {
    const htmlContent = await fs.readFile('./src/views/addCat.html', 'utf-8');

    const result = htmlContent.replace('{{breedOptions}}', renderBreedOptions());

    return result;
}

async function renderEditCatPage(catId) {
    const cat = findCatById(catId);

    if (!cat) {
        return renderPageNotFound();
    }

    const htmlContent = await fs.readFile('./src/views/editCat.html', 'utf-8');

    const result = htmlContent.replace('{{name}}', cat.name)
        .replace('{{description}}', cat.description)
        .replace('{{imageUrl}}', cat.imageUrl)
        .replace('{{breedOptions}}', renderBreedOptions(cat.breed));

    return result;
}

async function renderCatShelterPage(catId) {
    const cat = findCatById(catId);

    if (!cat) {
        return renderPageNotFound()
    };

    const breed = getBreadByName(cat.breed);

    const htmlContent = await fs.readFile('./src/views/catShelter.html', 'utf-8');

    const result = htmlContent.replaceAll('{{name}}', cat.name)
            .replace('{{imageUrl}}', cat.imageUrl)
            .replace('{{description}}', cat.description)
            .replace('{{breed.id}}', breed.id)
            .replace('{{breed.name}}', breed.name);

    return result;
}

async function renderPageNotFound() {
    return await fs.readFile('./src/views/notFound.html', 'utf-8');
}

function renderBreedOptions(selectedBreed) {
    const breeds = readBreeds();

    const breedOptionsTemplate = (breed) => `<option value="${breed.id}"${breed.name === selectedBreed ? ' selected' : ''}>${breed.name}</option>`;

    return breeds.map(breed => breedOptionsTemplate(breed)).join('\n');
}
