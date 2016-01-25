/**
 * Flashybox v0.1.0
 * A jQuery Plugin to Show image collage as flashy boxes.
 *
 *
 * Author: Kushal Pandya <kushalspandya@gmail.com> (https://doublslash.com)
 * Date: 25 January, 2015
 *
 * Flashybox Plugin.
 */

(function(factory) {
    'use strict';

    /**
     * Enable Module System to support CommonJS.
     * courtesy: SO <http://stackoverflow.com/a/11890239/414749>
     */
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    }
    else if (typeof exports === 'object') {
        module.exports = factory;
    }
    else {
        factory(jQuery);
    }

}(function($) {
    'use strict';

    var fullBoxTpl,
        lrBoxTpl,
        tbBoxTpl,
        prevBoxOrder = 0,
        fnGetNextBoxTpl,
        fnStrFormat,
        fnGetRandom,
        fnSwapImageSrc;

    fullBoxTpl = [
        '<span class="flashybox-item flashbox-full">',
            '<span class="image-container"><img src="{0}" alt="" /></span>',
        '</span>'
    ].join('');

    lrBoxTpl = [
        '<span class="flashybox-item flashbox-leftright">',
            '<span class="childbox-item childbox-full">',
                '<span class="image-container"><img src="{0}" alt="" /></span>',
            '</span>',
            '<span class="childbox-item childbox-topbottom">',
                '<span class="image-container"><img src="{1}" alt="" /></span>',
                '<span class="image-container"><img src="{2}" alt="" /></span>',
            '</span>',
        '</span>'
    ].join('');

    tbBoxTpl = [
        '<span class="flashybox-item flashbox-topbottom">',
            '<span class="childbox-item childbox-leftright">',
                '<span class="image-container"><img src="{0}" alt="" /></span>',
                '<span class="image-container"><img src="{1}" alt="" /></span>',
            '</span>',
            '<span class="childbox-item childbox-full">',
                '<span class="image-container"><img src="{2}" alt="" /></span>',
            '</span>',
        '</span>'
    ].join('');

    fnStrFormat = function() {
        var s = arguments[0],
            reg,
            i;

        for (i = 0; i < arguments.length - 1; i++) {
            reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arguments[i + 1]);
        }

        return s;
    };

    fnGetNextBoxTpl = function() {
        if (prevBoxOrder === 0)
        {
            prevBoxOrder = 1;
            return {type: 1, tpl: fullBoxTpl};
        }
        else if (prevBoxOrder === 1)
        {
            prevBoxOrder = 2;
            return {type: 2, tpl: lrBoxTpl};
        }
        else if (prevBoxOrder === 2)
        {
            prevBoxOrder = 3;
            return {type: 1, tpl: fullBoxTpl};
        }
        else
        {
            prevBoxOrder = 0;
            return {type: 3, tpl: tbBoxTpl};
        }
    };

    fnGetRandom = function(max) {
        return Math.floor(Math.random() * (max - 1 + 1)) + 1;
    };

    fnSwapImageSrc = function($imageRef, imageSrc) {
        $imageRef.fadeOut("slow", function() {
            $imageRef.attr('src', imageSrc);
            $imageRef.fadeIn("slow");
        });
    };

    $.fn.flashybox = function(config) {
        var defaultConfig = {},
            containerWidth = this.width(),
            imagesList = this.find('img'),
            imagesCount = imagesList.length,
            imagesSrcList = [],
            imageIndex = 0,
            totalWidth = 0,
            masterTpl = '',
            intervalObj,
            currentBoxTpl,
            i;

        /*** Default config options that Flashybox provides. ***/
        defaultConfig = {
            boxWidth: 300,                  // Width to Keep for Box
            flashDuration: 3000,            // Duration to wait before flash
            flashAllAtOnce: false            // Flash all Images at Once.
        };

        config = $.extend(defaultConfig, config);

        while (totalWidth < containerWidth)
        {
            currentBoxTpl = fnGetNextBoxTpl();

            if (currentBoxTpl.type === 1 &&
                imageIndex + 1 <= imagesCount)
            {
                masterTpl += fnStrFormat(currentBoxTpl.tpl, $(imagesList[imageIndex]).attr('src'));
                imageIndex++;
                totalWidth += config.boxWidth;
            }
            else if (imageIndex + 3 <= imagesCount)
            {
                masterTpl += fnStrFormat(currentBoxTpl.tpl,
                    $(imagesList[imageIndex++]).attr('src'),
                    $(imagesList[imageIndex++]).attr('src'),
                    $(imagesList[imageIndex++]).attr('src')
                );

                totalWidth += config.boxWidth;
            }

            if (totalWidth < containerWidth &&
                imageIndex >= imagesCount)
                imageIndex = 0;
        }

        this.html(masterTpl);

        imagesList = this.find('img');
        for (i = 0; i < imagesList.length; i++)
            imagesSrcList.push($(imagesList[i]).attr('src'));

        intervalObj = setInterval(function() {
            var imagesListCount = imagesList.length,
                targetImg = imagesList[fnGetRandom(imagesListCount)],
                newImgSrc = imagesSrcList[fnGetRandom(imagesListCount)];

            if (config.flashAllAtOnce)
            {
                imagesList.each(function(index, imgItem) {
                    fnSwapImageSrc($(imgItem), imagesSrcList[fnGetRandom(imagesListCount)]);
                });
            }
            else
                fnSwapImageSrc($(targetImg), newImgSrc);
        }, config.flashDuration);
    };
}));
