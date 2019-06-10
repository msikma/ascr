'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertToAnimation = undefined;

var _tmp = require('tmp');

var _tmp2 = _interopRequireDefault(_tmp);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var _filesize = require('filesize');

var _filesize2 = _interopRequireDefault(_filesize);

var _name = require('../util/name');

var _files = require('../util/files');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright © 2019, Michiel Sikma
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

/**
 * Make temp directories and move/unzip all files there.
 * When we're done, everything there will be deleted, even if an error is raised.
 * Returns a number of filenames we'll need to finish processing gif/webm files.
 */
var unzipAnimationFile = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(file, type) {
    var tmpDir, zipFile, zipDir, concatFile, paletteFile, tmpDestFile;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            tmpDir = _tmp2.default.dirSync({ unsafeCleanup: true });
            zipFile = tmpDir.name + '/' + file;
            zipDir = tmpDir.name + '/zipcontent';
            concatFile = zipDir + '/concat.txt';
            paletteFile = zipDir + '/palette.png';
            tmpDestFile = zipDir + '/out.' + type;
            _context.next = 8;
            return (0, _files.makeDirectory)(zipDir);

          case 8:
            _context.next = 10;
            return (0, _files.copyFile)(file, zipFile);

          case 10:
            _context.next = 12;
            return (0, _files.unzipFile)(zipFile, zipDir);

          case 12:
            return _context.abrupt('return', { zipDir: zipDir, paletteFile: paletteFile, concatFile: concatFile, tmpDestFile: tmpDestFile, tmpDir: tmpDir });

          case 13:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function unzipAnimationFile(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Returns some necessary information for processing the animation files in ffmpeg,
 * regardless of whether we're using gif or webm.
 */
var getFilenameInfo = function getFilenameInfo(file, n, images, type) {
  // Check which file extension the image files have, and how many numbers the filenames have.
  var firstFile = images[n].frames[0].file.split('.');
  var ext = firstFile.pop();
  var fnl = firstFile.shift().length;

  // Ensure we're not overwriting an existing file.
  var destFile = (0, _name.avoidDuplicates)('./' + (0, _name.getExtAndBase)(file).fn + '.' + type);

  return { ext: ext, fnl: fnl, destFile: destFile };
};

/**
 * Spawns ffmpeg with the given arguments and returns a promise.
 * The promise resolves after ffmpeg finishes, and rejects if it exits with a non-zero exit code.
 */
var ffmpegSpawn = function ffmpegSpawn(args) {
  return new Promise(function (resolve, reject) {
    var prc = (0, _child_process.spawn)('ffmpeg', args);
    prc.on('error', function (err) {
      return reject(err);
    });
    prc.on('close', function (code) {
      return code === 0 ? resolve() : reject(code);
    });
  });
};

/**
 * Checks whether ffmpeg is installed and usable.
 */
var ffmpegCheck = function ffmpegCheck() {
  return ffmpegSpawn(['-version']);
};

/**
 * Concat images to an animated gif using a palette and concat info file.
 * The basic command is: ffmpeg -y -f concat -safe 0 -i list.txt -i palette.png -lavfi paletteuse out.gif
 */
var makeGif = function makeGif(concatFile, paletteFile, destFile) {
  return ffmpegSpawn(['-y', '-f', 'concat', '-safe', '0', '-i', concatFile, '-i', paletteFile, '-lavfi', 'paletteuse=dither=floyd_steinberg:bayer_scale=3', destFile]);
};

/**
 * Concat images to a webm file using the concat demuxer.
 * The basic command is: ffmpeg -y -f concat -safe 0 -i list.txt -c:v libvpx -crf 12 -b:v 500K out.webm
 */
var makeWebm = function makeWebm(concatFile, destFile) {
  var crf = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '4';
  var bitrate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '1M';
  return ffmpegSpawn(['-y', '-f', 'concat', '-safe', '0', '-i', concatFile, '-c:v', 'libvpx', '-crf', crf, '-b:v', bitrate, destFile]);
};

/**
 * Uses ffmpeg to make a gif palette for our animation.
 * This significantly enhances the quality of the file.
 * The basic command is: ffmpeg -y -i "%06d.jpg" -vf palettegen palette.png
 */
var makePalette = function makePalette(zipDir, fnl, ext, paletteFile) {
  return (
    // Pad filename length with a leading zero.
    ffmpegSpawn(['-y', '-i', zipDir + '/%' + (fnl < 10 ? '0' + fnl : fnl) + 'd.' + ext, '-vf', 'palettegen=reserve_transparent=1:stats_mode=diff', paletteFile])
  );
};

/**
 * Generates a concat text with filenames and durations is used for making gif/webm files.
 * The content contains two lines for each frame: the filename, and then the duration in seconds.
 * This file should be saved and then passed to the ffmpeg concat filter.
 */
var createConcatInfo = function createConcatInfo(frameInfo) {
  return frameInfo.map(function (frame) {
    return 'file \'' + frame.file + '\'\nduration ' + frame.delay / 1000;
  }).join('\n');
};

/**
 * Used after conversion is complete. Prints 'done' and the file size of the generated file.
 */
var reportFileSize = function reportFileSize(file) {
  var fsize = (0, _filesize2.default)(_fs2.default.statSync(file).size, { base: 10, round: 1, standard: 'iec' });
  console.log('Done. File size: ' + fsize + '.');
};

/**
 * Converts a Pixiv animation to gif.
 *
 * This utilizes ffmpeg to do most of the work: first, all images are analyzed and
 * a palette is generated. Then, the gif itself is made based on that palette
 * and the frame information we scraped earlier.
 *
 * The frames of a Pixiv animation all have a custom duration in ms, which means we
 * need to copy these into a format usable by the 'concat' demuxer.
 */
var convertToGif = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(file, n, images) {
    var _getFilenameInfo, ext, fnl, destFile, frameInfoText, _ref3, zipDir, paletteFile, concatFile, tmpDestFile, tmpDir;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            console.log('Converting file ' + file + ' to animated gif...');

            // Extract base name, extension and a destination filename.
            _getFilenameInfo = getFilenameInfo(file, n, images, 'gif'), ext = _getFilenameInfo.ext, fnl = _getFilenameInfo.fnl, destFile = _getFilenameInfo.destFile;

            // An array of frame information objects, e.g. [{ file: '00000.jpg', delay: 120 }, ...] etc.

            frameInfoText = createConcatInfo(images[n].frames);

            // Unzip the original zip file and make a temp output file for our gif.

            _context2.next = 5;
            return unzipAnimationFile(file, 'gif');

          case 5:
            _ref3 = _context2.sent;
            zipDir = _ref3.zipDir;
            paletteFile = _ref3.paletteFile;
            concatFile = _ref3.concatFile;
            tmpDestFile = _ref3.tmpDestFile;
            tmpDir = _ref3.tmpDir;
            _context2.next = 13;
            return (0, _files.writeFile)(concatFile, frameInfoText);

          case 13:
            _context2.next = 15;
            return makePalette(zipDir, fnl, ext, paletteFile);

          case 15:
            _context2.next = 17;
            return makeGif(concatFile, paletteFile, tmpDestFile);

          case 17:
            _context2.next = 19;
            return (0, _files.moveFile)(tmpDestFile, destFile);

          case 19:
            _context2.next = 21;
            return (0, _files.unlinkFile)(file);

          case 21:
            reportFileSize(destFile);

            // Ensure removal of the temp directory.
            tmpDir.removeCallback();

          case 23:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function convertToGif(_x5, _x6, _x7) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Converts a Pixiv animation to webm.
 *
 * More or less the same as convertToGif(), except that we use a different extension
 * and pass different options to ffmpeg. See the comments in convertToGif()
 * to get an understanding of what's happening here.
 */
var convertToWebm = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(file, n, images) {
    var _getFilenameInfo2, destFile, frameInfoText, _ref5, concatFile, tmpDestFile, tmpDir;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            console.log('Converting file ' + file + ' to webm...');

            _getFilenameInfo2 = getFilenameInfo(file, n, images, 'webm'), destFile = _getFilenameInfo2.destFile;
            frameInfoText = createConcatInfo(images[n].frames);
            _context3.next = 5;
            return unzipAnimationFile(file, 'webm');

          case 5:
            _ref5 = _context3.sent;
            concatFile = _ref5.concatFile;
            tmpDestFile = _ref5.tmpDestFile;
            tmpDir = _ref5.tmpDir;
            _context3.next = 11;
            return (0, _files.writeFile)(concatFile, frameInfoText);

          case 11:
            _context3.next = 13;
            return makeWebm(concatFile, tmpDestFile);

          case 13:
            _context3.next = 15;
            return (0, _files.moveFile)(tmpDestFile, destFile);

          case 15:
            _context3.next = 17;
            return (0, _files.unlinkFile)(file);

          case 17:
            reportFileSize(destFile);
            tmpDir.removeCallback();

          case 19:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  }));

  return function convertToWebm(_x8, _x9, _x10) {
    return _ref4.apply(this, arguments);
  };
}();

/**
 * Converts a Pixiv animation to either gif or webm format.
 * In both cases we use ffmpeg to do the work.
 * See convertToGif() and convertToWebm() for more detailed information.
 */
var convertToAnimation = exports.convertToAnimation = function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(files, images) {
    var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'webm';
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (!(type === 'none')) {
              _context4.next = 2;
              break;
            }

            return _context4.abrupt('return');

          case 2:
            _context4.prev = 2;
            _context4.next = 5;
            return ffmpegCheck();

          case 5:
            _context4.next = 12;
            break;

          case 7:
            _context4.prev = 7;
            _context4.t0 = _context4['catch'](2);

            // If not, there's not much we can do.
            console.log('Tried to make an animated gif, but ffmpeg is not available.');
            console.log('See the documentation for how to install ffmpeg on your computer.');
            return _context4.abrupt('return');

          case 12:
            _context4.t1 = type;
            _context4.next = _context4.t1 === 'gif' ? 15 : _context4.t1 === 'webm' ? 16 : 17;
            break;

          case 15:
            return _context4.abrupt('return', Promise.all(files.map(function (file, n) {
              return convertToGif(file, n, images);
            })));

          case 16:
            return _context4.abrupt('return', Promise.all(files.map(function (file, n) {
              return convertToWebm(file, n, images);
            })));

          case 17:
            console.log('Unknown animation format specified.');
            return _context4.abrupt('break', 19);

          case 19:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined, [[2, 7]]);
  }));

  return function convertToAnimation(_x12, _x13) {
    return _ref6.apply(this, arguments);
  };
}();