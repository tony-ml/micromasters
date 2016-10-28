// @flow
/* global SETTINGS: false */
__webpack_public_path__ = `http://${SETTINGS.host}:8078/`;  // eslint-disable-line no-undef, camelcase
import React from 'react';
import ReactDOM from 'react-dom';

import FacultyCarousel from '../components/FacultyCarousel';

const carouselDiv = document.querySelector('#faculty-carousel');
if (carouselDiv !== null) {
  ReactDOM.render(
    <FacultyCarousel faculty={SETTINGS.faculty}/>,
    carouselDiv
  );
}
