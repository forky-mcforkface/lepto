const PngQuant = require('pngquant');

const png = (opts={}) => {
  const ncolors = typeof opts.ncolors !== 'undefined' ? opts.ncolors : 256;
  const quality = typeof opts.quality !== 'undefined' ? opts.quality : '70-80';
  const speed = typeof opts.speed !== 'undefined' ? opts.speed : 3;
  const args = [ncolors, '--nofs', '--quality', quality, '--speed', speed];

  return function png(input, fulfill, utils) {
    let finish = -input.outputs.length + 1;
    const next = () => {
      finish++;
      if (finish > 0) {
        fulfill(input);
      }
    };

    finish = -input.outputs.length + 1;
    for (let i in input.outputs) {
      if (utils.mime(input.outputs[i].buffer) === 'image/png') {
        const myPngQuanter = new PngQuant(args);

        const chunks = [];
        myPngQuanter.on('error', function(err) {
          console.log('err', err);
          next();
        }).on('data', function(chunk) {
          chunks.push(chunk);
        }).on('end', function() {
          const buffer = Buffer.concat(chunks);
          if (buffer.length < input.outputs[i].buffer.length) {
            input.outputs[i].buffer = buffer;
          }
          next();
        });
        myPngQuanter.end(input.outputs[i].buffer);
      }
      else {
        next();
      }
    }
  };
};

module.exports = png;
