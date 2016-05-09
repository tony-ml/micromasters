import assert from 'assert';
import moment from 'moment';
import React from 'react';

import {
  STATUS_NOT_OFFERED,
  STATUS_NOT_PASSED,
  STATUS_PASSED,
  STATUS_ENROLLED_NOT_VERIFIED,
  STATUS_OFFERED_NOT_ENROLLED,
  STATUS_VERIFIED_NOT_COMPLETED,
  USER_PROFILE_RESPONSE,
} from '../constants';
import {
  makeCourseStatusDisplay,
  makeCourseProgressDisplay,
  validateProfile,
  validateProfileComplete,
  makeStrippedHtml,
  validateMonth,
  validateYear,
} from '../util/util';
import PersonalTab from '../components/PersonalTab';
import EmploymentTab from '../components/EmploymentTab';
import PrivacyTab from '../components/PrivacyTab';

/* eslint-disable camelcase */
describe('utility functions', () => {
  describe('makeStrippedHtml', () => {
    it('strips HTML from a string', () => {
      assert.equal(makeStrippedHtml("<a href='x'>y</a>"), "y");
    });
    it('strips HTML from a react element', () => {
      assert.equal(makeStrippedHtml(<div><strong>text</strong></div>), "text");
    });
  });

  describe("makeCourseStatusDisplay", () => {
    let yesterday = '2016-03-30';
    let today = '2016-03-31';
    let tomorrow = '2016-04-01';

    let renderCourseStatusDisplay = (course, ...args) => {
      if (course.runs === undefined) {
        course.runs = [];
      }
      let textOrElement = makeCourseStatusDisplay(course, ...args);
      return makeStrippedHtml(textOrElement);
    };

    it('is a passed a course', () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_PASSED,
        grade: 0.34
      }), "34%");
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_PASSED
      }), "");
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_PASSED,
        grade: null
      }), "");
    });

    it("is a failed course", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_NOT_PASSED,
        grade: 0.99999
      }), "100%");
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_NOT_PASSED
      }), "");
    });

    it("is a verified course without a course start date", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_VERIFIED_NOT_COMPLETED
      }), "");
    });

    it("is a verified course with a course start date of tomorrow", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_VERIFIED_NOT_COMPLETED,
        course_start_date: tomorrow
      }, moment(today)), "Course starting: 4/1/2016");
    });

    it("is a verified course with a course start date of today", () => {
      // Note the lack of grade field
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_VERIFIED_NOT_COMPLETED,
        course_start_date: today
      }, moment(today)), "0%");
    });

    it("is a verified course with a course start date of yesterday", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_VERIFIED_NOT_COMPLETED,
        course_start_date: yesterday,
        grade: 0.33333
      }, moment(today)), "33%");
    });

    it("is an enrolled course with no verification date", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_ENROLLED_NOT_VERIFIED
      }, moment(today)), "");
    });

    it("is an enrolled course with a verification date of tomorrow", () => {
      assert.equal(
        renderCourseStatusDisplay({
          status: STATUS_ENROLLED_NOT_VERIFIED,
          verification_date: tomorrow
        }, moment(today)),
        "UPGRADE TO VERIFIED"
      );
    });

    it("is an enrolled course with a verification date of today", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_ENROLLED_NOT_VERIFIED,
        verification_date: today
      }, moment(today)), "");
    });

    it("is an enrolled course with a verification date of yesterday", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_ENROLLED_NOT_VERIFIED,
        verification_date: yesterday
      }, moment(today)), "");
    });

    it("is an offered course with no enrollment start date", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_OFFERED_NOT_ENROLLED,
        fuzzy_enrollment_start_date: "fuzzy start date"
      }), "fuzzy start date");
    });

    it("is an offered course with an enrollment date of tomorrow", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_OFFERED_NOT_ENROLLED,
        enrollment_start_date: tomorrow
      }, moment(today)), "Enrollment starting: 4/1/2016");
    });

    it("is an offered course with an enrollment date of today", () => {
      assert.equal(
        renderCourseStatusDisplay({
          status: STATUS_OFFERED_NOT_ENROLLED,
          enrollment_start_date: today
        }, moment(today)),
        "ENROLL"
      );
    });

    it("is an offered course with an enrollment date of yesterday", () => {
      assert.equal(
        renderCourseStatusDisplay({
          status: STATUS_OFFERED_NOT_ENROLLED,
          enrollment_start_date: yesterday
        }, moment(today)),
        "ENROLL"
      );
    });

    it("is a run, not a course. If there are any runs the first run should be picked", () => {
      assert.equal(
        renderCourseStatusDisplay({
          status: STATUS_NOT_OFFERED,
          runs: [{
            status: STATUS_OFFERED_NOT_ENROLLED,
            enrollment_start_date: yesterday
          }]
        }, moment(today)),
        "ENROLL"
      );
    });

    it("is a not offered course", () => {
      assert.equal(renderCourseStatusDisplay({
        status: STATUS_NOT_OFFERED
      }), "");
    });

    it("has a status we don't know about", () => {
      assert.equal(renderCourseStatusDisplay({
        status: "missing"
      }), "");
    });
  });

  describe("makeCourseStatusDisplay", () => {
    let renderCourseProgressDisplay = (course, ...args) => {
      if (course.runs === undefined) {
        course.runs = [];
      }
      let textOrElement = makeCourseProgressDisplay(course, ...args);
      return makeStrippedHtml(textOrElement);
    };

    it('is a course which is passed', () => {
      assert.equal(
        renderCourseProgressDisplay({
          status: STATUS_PASSED
        }),
        "Course passed"
      );
    });

    it('is a run which is passed. In this case the course status is ignored', () => {
      assert.equal(
        renderCourseProgressDisplay({
          status: STATUS_NOT_OFFERED,
          runs: [{
            status: STATUS_PASSED
          }]
        }),
        "Course passed"
      );
    });

    it('is a course which is in progress', () => {
      assert.equal(
        renderCourseProgressDisplay({
          status: STATUS_VERIFIED_NOT_COMPLETED
        }),
        "Course started"
      );
    });

    it('is a course which is not passed or in progress', () => {
      for (let status of [
        STATUS_NOT_PASSED,
        STATUS_ENROLLED_NOT_VERIFIED,
        STATUS_OFFERED_NOT_ENROLLED,
        STATUS_NOT_OFFERED,
      ]) {
        assert.equal(
          renderCourseProgressDisplay({
            status: status
          }),
          "Course not started"
        );
      }
    });
  });

  describe("validateProfile", () => {
    let requiredFields = [
      ['first_name'],
      ['last_name'],
      ['preferred_name'],
      ['gender'],
      ['preferred_language'],
      ['city'],
      ['country'],
      ['birth_city'],
      ['birth_country'],
      ['date_of_birth'],
    ];

    let messages = {
      'first_name': 'First Name',
      'last_name': 'Last Name',
      'preferred_name': 'Preferred Name',
      'gender': 'Gender',
      'preferred_language': 'Preferred language',
      'city': 'City',
      'country': 'Country',
      'birth_city': 'Birth City',
      'birth_country': 'Birth Country',
      'date_of_birth': 'Birth Date',
    };

    it('validates the test profile successfully', () => {
      let errors = validateProfile(USER_PROFILE_RESPONSE, requiredFields, messages);
      assert.deepEqual(errors, {});
    });

    it('validates required fields', () => {
      let profile = {};
      for (let key of requiredFields) {
        profile[key[0]] = '';
      }

      let errors = validateProfile(profile, requiredFields, messages);
      for (let key of requiredFields) {
        let error = errors[key];
        assert.ok(error.indexOf("is required") !== -1);
      }
    });

    it('validates nested fields', () => {
      let profile = {
        nested_array: [{foo: "bar", baz: null}]
      };
      const keysToCheck = [
        ["nested_array", 0, "foo"],
        ["nested_array", 0, "baz"],
      ];
      const nestMessages = {"baz": "Baz"};
      let errors = validateProfile(profile, keysToCheck, nestMessages);
      assert.deepEqual({nested_array: [ { baz: "Baz is required" } ] }, errors);
    });

    it('correctly validates fields with 0', () => {
      let profile = {
        nested_array: [{foo: 0}]
      };
      const keysToCheck = [
        ["nested_array", 0, "foo"]
      ];
      const nestMessages = {"foo": "Foo"};
      let errors = validateProfile(profile, keysToCheck, nestMessages);
      assert.deepEqual({}, errors);
    });
  });

  describe('validateProfileComplete', () => {
    let profile;
    beforeEach(() => {
      profile = {};
    });

    it('should return fields for dialog for an empty profile', () => {
      let expectation = [false, {
        url: "/profile/personal",
        title: "Personal Info",
        text: "Please complete your personal information.",
      }];
      assert.deepEqual(validateProfileComplete(profile), expectation);
    });

    it('should return appropriate fields for dialog when a field is missing', () => {
      PersonalTab.defaultProps.requiredFields.forEach( (field) => {
        profile[field[0]] = "filled in";
      });
      profile['account_privacy'] = '';
      let expectation = [false, {
        url: "/profile/privacy",
        title: "Privacy Settings",
        text: "Please complete the privacy settings.",
      }];
      assert.deepEqual(validateProfileComplete(profile), expectation);
    });

    it('should return true when all top-level fields are filled in', () => {
      PersonalTab.defaultProps.requiredFields.forEach( (field) => {
        profile[field[0]] = "filled in";
      });
      PrivacyTab.defaultProps.requiredFields.forEach( (field) => {
        profile[field[0]] = "filled in";
      });
      assert.deepEqual(validateProfileComplete(profile), [true, {}]);
    });

    it('should return true when all nested fields are filled in', () => {
      PersonalTab.defaultProps.requiredFields.forEach( (field) => {
        profile[field[0]] = "filled in";
      });
      PrivacyTab.defaultProps.requiredFields.forEach( (field) => {
        profile[field[0]] = "filled in";
      });
      profile['work_history'] = [{}];
      EmploymentTab.nestedValidationKeys.forEach( k => {
        profile['work_history'][0][k] = "filled in";
      });
      assert.deepEqual(validateProfileComplete(profile), [true, {}]);
    });

    it('should return fields for dialog when a nested field is missing', () => {
      PersonalTab.defaultProps.requiredFields.forEach( (field) => {
        profile[field[0]] = "filled in";
      });
      profile['work_history'] = [{}];
      EmploymentTab.nestedValidationKeys.forEach( k => {
        profile['work_history'][0][k] = "filled in";
      });
      profile['work_history'][0]['country'] = '';
      let expectation = [ false, {
        url: "/profile/professional",
        title: "Professional Info",
        text: "Please complete your work history information.",
      }];
      assert.deepEqual(validateProfileComplete(profile), expectation);
    });
  });

  describe('validateMonth', () => {
    it('handles months starting with 0 without treating as octal', () => {
      assert.equal(9, validateMonth("09"));
    });
    it('converts strings to numbers', () => {
      assert.equal(3, validateMonth("3"));
    });
    it('returns undefined for invalid months', () => {
      assert.equal(undefined, validateMonth("-3"));
      assert.equal(undefined, validateMonth("0"));
      assert.equal(1, validateMonth("1"));
      assert.equal(12, validateMonth("12"));
      assert.equal(undefined, validateMonth("13"));
    });
    it('returns undefined if the text is not an integer number', () => {
      assert.equal(undefined, validateMonth("two"));
      assert.equal(undefined, validateMonth(null));
      assert.equal(undefined, validateMonth({}));
      assert.equal(undefined, validateMonth(undefined));
      assert.equal(undefined, validateMonth("2e0"));
      assert.equal(undefined, validateMonth("3-4"));
      assert.equal(undefined, validateMonth("3.4"));
    });

    it('returns an empty string if passed an empty string', () => {
      assert.equal("", validateMonth(""));
    });
  });

  describe('validateYear', () => {
    it('handles years starting with 0 without treating as octal', () => {
      assert.equal(999, validateYear("0999"));
    });
    it('converts strings to numbers', () => {
      assert.equal(3, validateYear("3"));
    });
    it('returns undefined for invalid years', () => {
      assert.equal(undefined, validateYear("-3"));
      assert.equal(undefined, validateYear("0"));
      assert.equal(1, validateYear("1"));
      assert.equal(9999, validateYear("9999"));
      assert.equal(undefined, validateYear("10000"));
    });
    it('returns undefined if the text is not an integer number', () => {
      assert.equal(undefined, validateYear("two"));
      assert.equal(undefined, validateYear(null));
      assert.equal(undefined, validateYear({}));
      assert.equal(undefined, validateYear(undefined));
      assert.equal(undefined, validateYear("2e0"));
      assert.equal(undefined, validateYear("3-4"));
      assert.equal(undefined, validateYear("3.4"));
    });

    it('returns an empty string if passed an empty string', () => {
      assert.equal("", validateYear(""));
    });
  });
});
