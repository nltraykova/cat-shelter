import cats from './cats.js';
import { getBreedById } from './breedService.js';
import { v4 } from 'uuid';

export function readCats() {
    return cats;
}

export function addCat(catData) {
    const breedName = getBreedById(catData.breed)?.name || 'Unknown Breed';
    
    const newCat = {
        id: v4(),
        ...catData,
        breed: breedName
        };

    cats.push(newCat);
}