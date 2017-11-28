export const earth = {
  type: "planet",
  id: "earth",
  attributes: {
    name: "Earth",
    classification: "terrestrial",
    atmosphere: true,
  },
}

export const venus = {
  type: "planet",
  id: "venus",
  attributes: {
    name: "Venus",
    classification: "terrestrial",
    atmosphere: true,
  },
}

export const jupiter = {
  type: "planet",
  id: "jupiter",
  attributes: {
    name: "Jupiter",
    classification: "giant",
    atmosphere: true,
  },
}

export const theMoon = {
  type: "moon",
  id: "theMoon",
  attributes: {
    name: "The Moon",
  },
  relationships: {
    planet: {data: {type: "planet", id: "earth"}},
  },
}