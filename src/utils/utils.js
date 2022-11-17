import {
    ENVIRONMENT_ROWS,
    ENVIRONMENT_COLUMNS,
    API_URL
} from '../constants/global';

export const getGridCenter = () => {
    const middleRow = Math.floor((ENVIRONMENT_ROWS - 1) / 2);
    return (
        Math.floor(middleRow * ENVIRONMENT_COLUMNS + (ENVIRONMENT_COLUMNS - 1) / 2)
    );
}

export const getRandomDirectionAsIndex = (currentIndex) => {
    const randomIndex = Math.floor(Math.random() * 4) + 1;
    let newIndex;

    switch (randomIndex) {
        case 1:
            newIndex = currentIndex - ENVIRONMENT_COLUMNS;
            break;
        case 2:
            newIndex = currentIndex + ENVIRONMENT_COLUMNS;
            break;
        case 3:
            newIndex = currentIndex - 1;
            break;
        case 4:
            newIndex = currentIndex + 1;
            break;
        default:
            break;
    }

    return newIndex;
}

export async function fetchControlJSON(options) {
    const response = await fetch(API_URL, options);
    const json = await response.json();
    return json;
}