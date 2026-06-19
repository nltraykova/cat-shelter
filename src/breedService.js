import breeds from './breeds.js';
import { v4 } from 'uuid';

export function readBreeds() {
    return breeds;
}

export function addBreeds(breedName) {
    const breed = {
        id: v4(),
        name: breedName
    };

    breeds.push(breed);
}