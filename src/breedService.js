import breeds from './breeds.js';

export function readBreeds() {
    return breeds;
}

export function addBreeds(breedName) {
    const breed = {
        id: breeds.length + 1,
        name: breedName
    };

    breeds.push(breed);
}