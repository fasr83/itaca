// IDs verificados a mano contra la página oficial de cada canal (el método de
// adivinar por @handle da falsos positivos — YouTube a veces devuelve el id
// de un canal relacionado, no el que se pidió). Si algún canal deja de
// transmitir en vivo, el embed simplemente muestra "no disponible ahora"
// (algunos, como BBC News, bloquean el embed de su vivo por licencia — no
// es un error nuestro).
export interface Channel {
  id: string; // YouTube channel ID (UC...)
  name: string;
  group:
    | 'Noticias · Inglés'
    | 'Noticias · Español'
    | 'Negocios y Finanzas'
    | 'Radio · Español'
    | 'Espacio'
    | 'Webcams';
}

export const CHANNELS: Channel[] = [
  { id: 'UC16niRr50-MSBwiO3YDb3RA', name: 'BBC News', group: 'Noticias · Inglés' },
  { id: 'UCNye-wNBqNL5ZzHSJj3l8Bg', name: 'Al Jazeera English', group: 'Noticias · Inglés' },
  { id: 'UCknLrEdhRCp1aegoMqRaCZg', name: 'DW News', group: 'Noticias · Inglés' },
  { id: 'UCQfwfsi5VrQ8yKZ-UWmAEFg', name: 'FRANCE 24 English', group: 'Noticias · Inglés' },
  { id: 'UCoMdktPbSTixAyNGwb-UYkQ', name: 'Sky News', group: 'Noticias · Inglés' },

  { id: 'UCUBIrDsIVzRpKsClMlSlTpQ', name: 'BBC News Mundo', group: 'Noticias · Español' },
  { id: 'UCT4Jg8h03dD0iN3Pb5L0PMA', name: 'DW Español', group: 'Noticias · Español' },
  { id: 'UCUdOoVWuWmgo1wByzcsyKDQ', name: 'FRANCE 24 Español', group: 'Noticias · Español' },
  { id: 'UCyoGb3SMlTlB8CLGVH4c8Rw', name: 'euronews (en español)', group: 'Noticias · Español' },

  { id: 'UCIALMKvObZNtJ6AmdCLP7Lg', name: 'Bloomberg Television', group: 'Negocios y Finanzas' },
  { id: 'UCp6zvh6_oW2pXbk0gPSjzyg', name: 'Bloomberg en Español', group: 'Negocios y Finanzas' },
  { id: 'UCvJJ_dzjViJCoLf5uKUTwoA', name: 'CNBC', group: 'Negocios y Finanzas' },
  { id: 'UCEAZeUIeJs0IjQiqTCdVSIg', name: 'Yahoo Finance', group: 'Negocios y Finanzas' },
  { id: 'UCPYQ564F-6kEaiX1wwmzDNA', name: 'Investing.com', group: 'Negocios y Finanzas' },

  { id: 'UCQ2Fej5pr1ipVeBWTX8Sc_Q', name: 'Cadena SER (España)', group: 'Radio · Español' },
  { id: 'UC8romJHgddXwtjW5XJ86d1Q', name: 'W Radio (México/Colombia)', group: 'Radio · Español' },
  { id: 'UCgcUYL6ODQniPuwD4N-Tlvg', name: 'Radio Nacional Argentina', group: 'Radio · Español' },
  { id: 'UCNAJlRrXYFi8jo889TbxPiw', name: 'Caracol Radio (Colombia)', group: 'Radio · Español' },

  { id: 'UCLA_DiR1FfKNvjuUpBHmylQ', name: 'NASA', group: 'Espacio' },
  { id: 'UCn_F-1y9mx99zpmD0QkfNMw', name: 'NASA en Español', group: 'Espacio' },

  { id: 'UC6qrG3W8SMK0jior2olka3g', name: 'EarthCam', group: 'Webcams' },
];
