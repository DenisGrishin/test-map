/******/ (() => {
  // webpackBootstrap
  /******/ "use strict";
  var __webpack_exports__ = {}; // CONCATENATED MODULE: ./src/js/libs/popup.js

  // Класс Popup
  class Popup {
    constructor(options) {
      let config = {
        logging: true,
        init: true,
        // Для кнопок
        attributeOpenButton: "data-popup", // Атрибут для кнопки, которая вызывает попап
        attributeCloseButton: "data-close", // Атрибут для кнопки, которая закрывает попап
        // Для сторонних объектов
        fixElementSelector: "[data-lp]", // Атрибут для элементов с левым паддингом (которые fixed)
        // Для объекта попапа
        youtubeAttribute: "data-youtube", // Атрибут для кода youtube
        youtubePlaceAttribute: "data-youtube-place", // Атрибут для вставки ролика youtube
        setAutoplayYoutube: true,
        // Изменение классов
        classes: {
          popup: "popup",
          popupWrapper: "popup__wrapper",
          popupContent: "popup__content",
          popupActive: "popup_show", // Добавляется для попапа, когда он открывается
          bodyActive: "popup-show", // Добавляется для боди, когда попап открыт
        },
        focusCatch: false, // Фокус внутри попапа зациклен
        closeEsc: true, // Закрытие по ESC
        bodyLock: true, // Блокировка скролла
        bodyLockDelay: 500, // Задержка блокировки скролла

        on: {
          // События
          beforeOpen: function () {},
          afterOpen: function () {},
          beforeClose: function () {
            let link = document.querySelectorAll("._video-yt-link");
            let button = document.querySelectorAll("._video-yt-btn");
            const videoBlock = document.querySelector("#youtube-slide");
            if (videoBlock) {
              button.forEach((element) => {
                element.style.display = "block";
              });
              link.forEach((element) => {
                element.style.display = "block";
              });

              videoBlock.remove();
            }
          },
          afterClose: function () {},
        },
      };
      this.isOpen = false;
      // Текущее окно
      this.targetOpen = {
        selector: false,
        element: false,
      };
      // Предыдущее открытое
      this.previousOpen = {
        selector: false,
        element: false,
      };
      // Последнее закрытое
      this.lastClosed = {
        selector: false,
        element: false,
      };
      this._dataValue = false;
      this.hash = false;

      this._reopen = false;
      this._selectorOpen = false;

      this.lastFocusEl = false;
      this._focusEl = [
        "a[href]",
        'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
        "button:not([disabled]):not([aria-hidden])",
        "select:not([disabled]):not([aria-hidden])",
        "textarea:not([disabled]):not([aria-hidden])",
        "area[href]",
        "iframe",
        "object",
        "embed",
        "[contenteditable]",
        '[tabindex]:not([tabindex^="-"])',
      ];
      //this.options = Object.assign(config, options);
      this.options = {
        ...config,
        ...options,
        classes: {
          ...config.classes,
          ...options?.classes,
        },
        hashSettings: {
          ...config.hashSettings,
          ...options?.hashSettings,
        },
        on: {
          ...config.on,
          ...options?.on,
        },
      };
      this.options.init ? this.initPopups() : null;
    }
    initPopups() {
      this.eventsPopup();
    }
    eventsPopup() {
      // Клик на всем документе
      document.addEventListener(
        "click",
        function (e) {
          // Клик по кнопке "открыть"
          const buttonOpen = e.target.closest(
            `[${this.options.attributeOpenButton}]`,
          );
          if (buttonOpen) {
            e.preventDefault();
            this._dataValue = buttonOpen.getAttribute(
              this.options.attributeOpenButton,
            )
              ? buttonOpen.getAttribute(this.options.attributeOpenButton)
              : "error";
            if (this._dataValue !== "error") {
              if (!this.isOpen) this.lastFocusEl = buttonOpen;
              this.targetOpen.selector = `${this._dataValue}`;
              this._selectorOpen = true;
              this.open();
              return;
            }

            return;
          }
          // Закрытие на пустом месте (popup__wrapper) и кнопки закрытия (popup__close) для закрытия
          const buttonClose = e.target.closest(
            `[${this.options.attributeCloseButton}]`,
          );
          console.log();
          if (
            buttonClose ||
            (!e.target.closest(`.submitted__slider-navigation-next`) &&
              !e.target.closest(`.submitted__slider-navigation-prev`) &&
              !e.target.closest(`.popup-reels__slide`) &&
              !e.target.closest(`.popup-video__slide`) &&
              this.isOpen)
          ) {
            e.preventDefault();

            this.close();
            return;
          }
        }.bind(this),
      );
      // Закрытие по ESC
      document.addEventListener(
        "keydown",
        function (e) {
          if (
            this.options.closeEsc &&
            e.which == 27 &&
            e.code === "Escape" &&
            this.isOpen
          ) {
            e.preventDefault();
            this.close();
            return;
          }
          if (this.options.focusCatch && e.which == 9 && this.isOpen) {
            this._focusCatch(e);
            return;
          }
        }.bind(this),
      );
      // Событие отправки формы
      if (document.querySelector("form[data-ajax],form[data-dev]")) {
        document.addEventListener(
          "formSent",
          function (e) {
            const popup = e.detail.form.dataset.popupMessage;
            if (popup) {
              this.open(popup);
            }
          }.bind(this),
        );
      }
      // Открытие по хешу
      if (this.options.hashSettings.goHash) {
        // Проверка изменения адресной строки
        window.addEventListener(
          "hashchange",
          function () {
            if (window.location.hash) {
              this._openToHash();
            } else {
              this.close(this.targetOpen.selector);
            }
          }.bind(this),
        );

        window.addEventListener(
          "load",
          function () {
            if (window.location.hash) {
              this._openToHash();
            }
          }.bind(this),
        );
      }
    }
    open(selectorValue) {
      // Если ввести значение селектора (селектор настраивается в options)
      if (
        selectorValue &&
        typeof selectorValue === "string" &&
        selectorValue.trim() !== ""
      ) {
        this.targetOpen.selector = selectorValue;
        this._selectorOpen = true;
      }
      if (this.isOpen) {
        this._reopen = true;
        this.close();
      }
      if (!this._selectorOpen)
        this.targetOpen.selector = this.lastClosed.selector;
      if (!this._reopen) this.previousActiveElement = document.activeElement;

      this.targetOpen.element = document.querySelector(
        this.targetOpen.selector,
      );

      if (this.targetOpen.element) {
        // YouTube
        if (
          this.targetOpen.element.hasAttribute(this.options.youtubeAttribute)
        ) {
          const codeVideo = this.targetOpen.element.getAttribute(
            this.options.youtubeAttribute,
          );

          const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`;

          const iframe = document.createElement("iframe");
          iframe.setAttribute("allowfullscreen", "");

          const autoplay = this.options.setAutoplayYoutube ? "autoplay;" : "";
          iframe.setAttribute("allow", `${autoplay}; encrypted-media`);

          iframe.setAttribute("src", urlVideo);

          if (
            this.targetOpen.element.querySelector(
              `[${this.options.youtubePlaceAttribute}]`,
            )
          )
            this.targetOpen.element
              .querySelector(`[${this.options.youtubePlaceAttribute}]`)
              .appendChild(iframe);
        }
        if (this.options.hashSettings.location) {
          // Получение хэша и его выставление
          this._getHash();
          this._setHash();
        }

        // До открытия
        this.options.on.beforeOpen(this);

        this.targetOpen.element.classList.add(this.options.classes.popupActive);
        document.body.classList.add(this.options.classes.bodyActive);

        // if (!this._reopen) bodyLockToggle();
        // else this._reopen = false;

        this.targetOpen.element.setAttribute("aria-hidden", "false");

        // // Запоминаю это открытое окно. Оно будет последним открытым
        this.previousOpen.selector = this.targetOpen.selector;
        this.previousOpen.element = this.targetOpen.element;

        this._selectorOpen = false;

        this.isOpen = true;

        // После открытия
        //this.options.on.afterOpen(this);

        // Создаем свое событие после открытия попапа
        document.dispatchEvent(
          new CustomEvent("afterPopupOpen", {
            detail: {
              popup: this,
            },
          }),
        );
      }
    }

    close(selectorValue) {
      if (
        selectorValue &&
        typeof selectorValue === "string" &&
        selectorValue.trim() !== ""
      ) {
        this.previousOpen.selector = selectorValue;
      }

      if (!this.isOpen || !bodyLockStatus) {
        return;
      }
      // До закрытия

      this.options.on.beforeClose(this);
      // YouTube

      if (this.targetOpen.element.hasAttribute(this.options.youtubeAttribute)) {
        if (
          this.targetOpen.element.querySelector(
            `[${this.options.youtubePlaceAttribute}]`,
          )
        )
          this.targetOpen.element.querySelector(
            `[${this.options.youtubePlaceAttribute}]`,
          ).innerHTML = "";
      }

      this.previousOpen.element.classList.remove(
        this.options.classes.popupActive,
      );
      // aria-hidden
      this.previousOpen.element.setAttribute("aria-hidden", "true");

      if (!this._reopen) {
        document.body.classList.remove(this.options.classes.bodyActive);
        bodyLockToggle();
        this.isOpen = false;
      }
      // Очищение адресной строки

      if (this._selectorOpen) {
        this.lastClosed.selector = this.previousOpen.selector;
        this.lastClosed.element = this.previousOpen.element;
      }
      // После закрытия
      this.options.on.afterClose(this);
    }
  } // CONCATENATED MODULE: ./src/js/files/functions.js

  // Вспомогательные модули плавного расскрытия и закрытия объекта ======================================================================================================================================================================
  let _slideUp = (target, duration = 500, showmore = 0) => {
    if (!target.classList.contains("_slide")) {
      target.classList.add("_slide");
      target.style.transitionProperty = "height, margin, padding";
      target.style.transitionDuration = duration + "ms";
      target.style.height = `${target.offsetHeight}px`;
      target.offsetHeight;
      target.style.overflow = "hidden";
      target.style.height = showmore ? `${showmore}px` : `0px`;
      target.style.paddingTop = 0;
      target.style.paddingBottom = 0;
      target.style.marginTop = 0;
      target.style.marginBottom = 0;
      window.setTimeout(() => {
        target.hidden = !showmore ? true : false;
        !showmore ? target.style.removeProperty("height") : null;
        target.style.removeProperty("padding-top");
        target.style.removeProperty("padding-bottom");
        target.style.removeProperty("margin-top");
        target.style.removeProperty("margin-bottom");
        !showmore ? target.style.removeProperty("overflow") : null;
        target.style.removeProperty("transition-duration");
        target.style.removeProperty("transition-property");
        target.classList.remove("_slide");
      }, duration);
    }
  };
  let _slideDown = (target, duration = 500, showmore = 0) => {
    if (!target.classList.contains("_slide")) {
      target.classList.add("_slide");
      target.hidden = target.hidden ? false : null;
      showmore ? target.style.removeProperty("height") : null;
      let height = target.offsetHeight;
      target.style.overflow = "hidden";
      target.style.height = showmore ? `${showmore}px` : `0px`;
      target.style.paddingTop = 0;
      target.style.paddingBottom = 0;
      target.style.marginTop = 0;
      target.style.marginBottom = 0;
      target.offsetHeight;
      target.style.transitionProperty = "height, margin, padding";
      target.style.transitionDuration = duration + "ms";
      target.style.height = height + "px";
      target.style.removeProperty("padding-top");
      target.style.removeProperty("padding-bottom");
      target.style.removeProperty("margin-top");
      target.style.removeProperty("margin-bottom");
      window.setTimeout(() => {
        target.style.removeProperty("height");
        target.style.removeProperty("overflow");
        target.style.removeProperty("transition-duration");
        target.style.removeProperty("transition-property");
        target.classList.remove("_slide");
      }, duration);
    }
  };
  let _slideToggle = (target, duration = 500) => {
    if (target.hidden) {
      return _slideDown(target, duration);
    } else {
      return _slideUp(target, duration);
    }
  };
  // Вспомогательные модули блокировки прокрутки и скочка ====================================================================================================================================================================================================================================================================================
  // Вспомогательные модули блокировки прокрутки и скочка ====================================================================================================================================================================================================================================================================================
  let bodyLockStatus = true;
  let bodyLockToggle = (delay = 1) => {
    if (document.documentElement.classList.contains("lock")) {
      bodyUnlock(delay);
    } else {
      bodyLock(delay);
    }
  };
  let bodyUnlock = (delay = 1) => {
    let body = document.querySelector("body");
    if (bodyLockStatus) {
      let lock_padding = document.querySelectorAll("[data-lp]");
      setTimeout(() => {
        for (let index = 0; index < lock_padding.length; index++) {
          const el = lock_padding[index];
          el.style.paddingRight = "0px";
        }
        body.style.paddingRight = "0px";
        document.documentElement.classList.remove("lock");
      }, delay);
      bodyLockStatus = false;
      setTimeout(function () {
        bodyLockStatus = true;
      }, delay);
    }
  };
  let bodyLock = (delay = 1) => {
    let body = document.querySelector("body");
    if (bodyLockStatus) {
      let lock_padding = document.querySelectorAll("[data-lp]");
      for (let index = 0; index < lock_padding.length; index++) {
        const el = lock_padding[index];
        el.style.paddingRight =
          window.innerWidth -
          document.querySelector(".wrapper").offsetWidth +
          "px";
      }

      body.style.paddingRight =
        window.innerWidth - document.querySelector("body").offsetWidth + "px";
      document.documentElement.classList.add("lock");

      bodyLockStatus = false;
      setTimeout(function () {
        bodyLockStatus = true;
      }, delay);
    }
  };
  // Модуль работы со спойлерами =======================================================================================================================================================================================================================
  /*
Для родителя слойлеров пишем атрибут data-spollers
Для заголовков слойлеров пишем атрибут data-spoller
Если нужно включать\выключать работу спойлеров на разных размерах экранов
пишем параметры ширины и типа брейкпоинта.

Например: 
data-spollers="992,max" - спойлеры будут работать только на экранах меньше или равно 992px
data-spollers="768,min" - спойлеры будут работать только на экранах больше или равно 768px

Если нужно что бы в блоке открывался болько один слойлер добавляем атрибут data-one-spoller
*/
  function spollers() {
    const spollersArray = document.querySelectorAll("[data-spollers]");
    if (spollersArray.length > 0) {
      // Получение обычных слойлеров
      const spollersRegular = Array.from(spollersArray).filter(
        function (item, index, self) {
          return !item.dataset.spollers.split(",")[0];
        },
      );
      // Инициализация обычных слойлеров
      if (spollersRegular.length) {
        initSpollers(spollersRegular);
      }

      // Инициализация
      function initSpollers(spollersArray, matchMedia = false) {
        spollersArray.forEach((spollersBlock) => {
          spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
          if (matchMedia.matches || !matchMedia) {
            spollersBlock.classList.add("_spoller-init");
            initSpollerBody(spollersBlock);
            spollersBlock.addEventListener("click", setSpollerAction);
          } else {
            spollersBlock.classList.remove("_spoller-init");
            initSpollerBody(spollersBlock, false);
            spollersBlock.removeEventListener("click", setSpollerAction);
          }
        });
      }
      // Работа с контентом
      function initSpollerBody(spollersBlock, hideSpollerBody = true) {
        const spollerTitles = spollersBlock.querySelectorAll("[data-spoller]");
        if (spollerTitles.length > 0) {
          spollerTitles.forEach((spollerTitle) => {
            if (hideSpollerBody) {
              spollerTitle.removeAttribute("tabindex");
              if (!spollerTitle.classList.contains("_spoller-active")) {
                spollerTitle.nextElementSibling.hidden = true;
              }
            } else {
              spollerTitle.setAttribute("tabindex", "-1");
              spollerTitle.nextElementSibling.hidden = false;
            }
          });
        }
      }
      function setSpollerAction(e) {
        const el = e.target;
        if (el.closest("[data-spoller]")) {
          const spollerTitle = el.closest("[data-spoller]");
          const spollersBlock = spollerTitle.closest("[data-spollers]");
          const oneSpoller = spollersBlock.hasAttribute("data-one-spoller")
            ? true
            : false;
          if (!spollersBlock.querySelectorAll("._slide").length) {
            if (
              oneSpoller &&
              !spollerTitle.classList.contains("_spoller-active")
            ) {
              hideSpollersBody(spollersBlock);
            }
            spollerTitle.classList.toggle("_spoller-active");
            _slideToggle(spollerTitle.nextElementSibling, 300);
          }
          e.preventDefault();
        }
      }
      function hideSpollersBody(spollersBlock) {
        const spollerActiveTitle = spollersBlock.querySelector(
          "[data-spoller]._spoller-active",
        );
        if (spollerActiveTitle) {
          spollerActiveTitle.classList.remove("_spoller-active");
          _slideUp(spollerActiveTitle.nextElementSibling, 300);
        }
      }
    }
  }
  // Модуь работы с табами =======================================================================================================================================================================================================================
  /*
Для родителя табов пишем атрибут data-tabs
Для родителя заголовков табов пишем атрибут data-tabs-titles
Для родителя блоков табов пишем атрибут data-tabs-body

Если нужно чтобы табы открывались с анимацией 
добавляем к data-tabs data-tabs-animate
По умолчанию, скорость анимации 500ms, 
указать свою скорость можно так: data-tabs-animate="1000"

Если нужно чтобы табы превращались в "спойлеры" на неком размере экранов пишем параметры ширины.
Например: data-tabs="992" - табы будут превращаться в спойлеры на экранах меньше или равно 992px
*/
  function tabs() {
    const tabs = document.querySelectorAll("[data-tabs]");
    let tabsActiveHash = [];

    if (tabs.length > 0) {
      const hash = location.hash.replace("#", "");
      if (hash.startsWith("tab-")) {
        tabsActiveHash = hash.replace("tab-", "").split("-");
      }
      tabs.forEach((tabsBlock, index) => {
        tabsBlock.classList.add("_tab-init");
        tabsBlock.setAttribute("data-tabs-index", index);
        tabsBlock.addEventListener("click", setTabsAction);
        initTabs(tabsBlock);
      });
    }

    // Работа с контентом
    function initTabs(tabsBlock) {
      const tabsTitles = tabsBlock.querySelectorAll("[data-tabs-titles]>*");
      const tabsContent = tabsBlock.querySelectorAll("[data-tabs-body]>*");
      const tabsBlockIndex = tabsBlock.dataset.tabsIndex;
      const tabsActiveHashBlock = tabsActiveHash[0] == tabsBlockIndex;

      if (tabsActiveHashBlock) {
        const tabsActiveTitle = tabsBlock.querySelector(
          "[data-tabs-titles]>._tab-active",
        );
        tabsActiveTitle.classList.remove("_tab-active");
      }
      if (tabsContent.length > 0) {
        tabsContent.forEach((tabsContentItem, index) => {
          tabsTitles[index].setAttribute("data-tabs-title", "");
          tabsContentItem.setAttribute("data-tabs-item", "");

          if (tabsActiveHashBlock && index == tabsActiveHash[1]) {
            tabsTitles[index].classList.add("_tab-active");
          }
          tabsContentItem.hidden =
            !tabsTitles[index].classList.contains("_tab-active");
        });
      }
    }
    function setTabsStatus(tabsBlock) {
      const tabsTitles = tabsBlock.querySelectorAll("[data-tabs-title]");
      const tabsContent = tabsBlock.querySelectorAll("[data-tabs-item]");
      const tabsBlockIndex = tabsBlock.dataset.tabsIndex;

      function isTabsAnamate(tabsBlock) {
        if (tabsBlock.hasAttribute("data-tabs-animate")) {
          return tabsBlock.dataset.tabsAnimate > 0
            ? tabsBlock.dataset.tabsAnimate
            : 500;
        }
      }
      const tabsBlockAnimate = isTabsAnamate(tabsBlock);

      if (tabsContent.length > 0) {
        tabsContent.forEach((tabsContentItem, index) => {
          if (tabsTitles[index].classList.contains("_tab-active")) {
            if (tabsBlockAnimate) {
              _slideDown(tabsContentItem, tabsBlockAnimate);
            } else {
              tabsContentItem.hidden = false;
            }
            if (!tabsContentItem.closest(".popup")) {
              location.hash = `tab-${tabsBlockIndex}-${index}`;
            }
          } else {
            if (tabsBlockAnimate) {
              _slideUp(tabsContentItem, tabsBlockAnimate);
            } else {
              tabsContentItem.hidden = true;
            }
          }
        });
      }
    }
    function setTabsAction(e) {
      const el = e.target;
      if (el.closest("[data-tabs-title]")) {
        const tabTitle = el.closest("[data-tabs-title]");
        const tabsBlock = tabTitle.closest("[data-tabs]");
        if (
          !tabTitle.classList.contains("_tab-active") &&
          !tabsBlock.querySelectorAll("._slide").length
        ) {
          const tabActiveTitle = tabsBlock.querySelector(
            "[data-tabs-title]._tab-active",
          );
          if (tabActiveTitle) {
            tabActiveTitle.classList.remove("_tab-active");
          }

          tabTitle.classList.add("_tab-active");
          setTabsStatus(tabsBlock);
        }
        e.preventDefault();
      }
    }
  }

  // Модуль "показать еще" =======================================================================================================================================================================================================================
  /*
Документация по работе в шаблоне:
data-showmore-media = "768,min"
data-showmore="size/items"
data-showmore-content="размер/кол-во"
data-showmore-button="скорость"
Сниппет (HTML): showmore
*/
  function showMore() {
    const showMoreBlocks = document.querySelectorAll("[data-showmore]");
    let showMoreBlocksRegular;
    let mdQueriesArray;
    if (showMoreBlocks.length) {
      // Получение обычных объектов
      showMoreBlocksRegular = Array.from(showMoreBlocks).filter(
        function (item, index, self) {
          return !item.dataset.showmoreMedia;
        },
      );
      // Инициализация обычных объектов
      showMoreBlocksRegular.length ? initItems(showMoreBlocksRegular) : null;

      document.addEventListener("click", showMoreActions);
      window.addEventListener("resize", showMoreActions);
    }
    function initItemsMedia(mdQueriesArray) {
      mdQueriesArray.forEach((mdQueriesItem) => {
        initItems(mdQueriesItem.itemsArray, mdQueriesItem.matchMedia);
      });
    }
    function initItems(showMoreBlocks, matchMedia) {
      showMoreBlocks.forEach((showMoreBlock) => {
        initItem(showMoreBlock, matchMedia);
      });
    }
    function initItem(showMoreBlock, matchMedia = false) {
      showMoreBlock = matchMedia ? showMoreBlock.item : showMoreBlock;
      const showMoreContent = showMoreBlock.querySelector(
        "[data-showmore-content]",
      );
      const showMoreButton = showMoreBlock.querySelector(
        "[data-showmore-button]",
      );
      const hiddenHeight = getHeight(showMoreBlock, showMoreContent);
      if (matchMedia.matches || !matchMedia) {
        if (hiddenHeight < getOriginalHeight(showMoreContent)) {
          _slideUp(showMoreContent, 0, hiddenHeight);
          showMoreButton.hidden = false;
        } else {
          _slideDown(showMoreContent, 0, hiddenHeight);
          showMoreButton.hidden = true;
        }
      } else {
        _slideDown(showMoreContent, 0, hiddenHeight);
        showMoreButton.hidden = true;
      }
    }
    function getHeight(showMoreBlock, showMoreContent) {
      let hiddenHeight = 0;
      const showMoreType = showMoreBlock.dataset.showmore
        ? showMoreBlock.dataset.showmore
        : "size";
      if (showMoreType === "items") {
        const showMoreTypeValue = showMoreContent.dataset.showmoreContent
          ? showMoreContent.dataset.showmoreContent
          : 3;
        const showMoreItems = showMoreContent.children;
        for (let index = 1; index < showMoreItems.length; index++) {
          const showMoreItem = showMoreItems[index - 1];
          hiddenHeight += showMoreItem.offsetHeight;
          if (index === showMoreTypeValue) break;
        }
      } else {
        const showMoreTypeValue = showMoreContent.dataset.showmoreContent
          ? showMoreContent.dataset.showmoreContent
          : 150;
        hiddenHeight = showMoreTypeValue;
      }
      return hiddenHeight;
    }
    function getOriginalHeight(showMoreContent) {
      let hiddenHeight = showMoreContent.offsetHeight;
      showMoreContent.style.removeProperty("height");
      let originalHeight = showMoreContent.offsetHeight;
      showMoreContent.style.height = `${hiddenHeight}px`;
      return originalHeight;
    }
    function showMoreActions(e) {
      const targetEvent = e.target;
      const targetType = e.type;
      if (targetType === "click") {
        if (targetEvent.closest("[data-showmore-button]")) {
          const showMoreButton = targetEvent.closest("[data-showmore-button]");
          const showMoreBlock = showMoreButton.closest("[data-showmore]");
          const showMoreContent = showMoreBlock.querySelector(
            "[data-showmore-content]",
          );
          const showMoreSpeed = showMoreBlock.dataset.showmoreButton
            ? showMoreBlock.dataset.showmoreButton
            : "500";
          const hiddenHeight = getHeight(showMoreBlock, showMoreContent);
          if (!showMoreContent.classList.contains("_slide")) {
            showMoreBlock.classList.contains("_showmore-active")
              ? _slideUp(showMoreContent, showMoreSpeed, hiddenHeight)
              : _slideDown(showMoreContent, showMoreSpeed, hiddenHeight);
            showMoreBlock.classList.toggle("_showmore-active");
          }
        }
      } else if (targetType === "resize") {
        showMoreBlocksRegular.length ? initItems(showMoreBlocksRegular) : null;
        // mdQueriesArray.length ? initItemsMedia(mdQueriesArray) : null;
      }
    }
  }
  // Модуль попапов ===========================================================================================================================================================================================================================
  /*
Документация по работе в шаблоне:
data-popup - Атрибут для кнопки, которая вызывает попап
data-close - Атрибут для кнопки, которая закрывает попап
data-youtube - Атрибут для кода youtube
Сниппет (HTML): pl
*/

  const initPopups = () => new Popup({}); // CONCATENATED MODULE: ./node_modules/nouislider/dist/nouislider.mjs

  //================================================================================================================================================================================================================================================================================================================
  // Прочие полезные функции ================================================================================================================================================================================================================================================================================================================
  //================================================================================================================================================================================================================================================================================================================

  //================================================================================================================================================================================================================================================================================================================

  var PipsMode;
  (function (PipsMode) {
    PipsMode["Range"] = "range";
    PipsMode["Steps"] = "steps";
    PipsMode["Positions"] = "positions";
    PipsMode["Count"] = "count";
    PipsMode["Values"] = "values";
  })(PipsMode || (PipsMode = {}));
  var PipsType;
  (function (PipsType) {
    PipsType[(PipsType["None"] = -1)] = "None";
    PipsType[(PipsType["NoValue"] = 0)] = "NoValue";
    PipsType[(PipsType["LargeValue"] = 1)] = "LargeValue";
    PipsType[(PipsType["SmallValue"] = 2)] = "SmallValue";
  })(PipsType || (PipsType = {}));
  //region Helper Methods
  function isValidFormatter(entry) {
    return isValidPartialFormatter(entry) && typeof entry.from === "function";
  }
  function isValidPartialFormatter(entry) {
    // partial formatters only need a to function and not a from function
    return typeof entry === "object" && typeof entry.to === "function";
  }
  function removeElement(el) {
    el.parentElement.removeChild(el);
  }
  function isSet(value) {
    return value !== null && value !== undefined;
  }
  // Bindable version
  function preventDefault(e) {
    e.preventDefault();
  }
  // Removes duplicates from an array.
  function unique(array) {
    return array.filter(function (a) {
      return !this[a] ? (this[a] = true) : false;
    }, {});
  }
  // Round a value to the closest 'to'.
  function closest(value, to) {
    return Math.round(value / to) * to;
  }
  // Current position of an element relative to the document.
  function offset(elem, orientation) {
    var rect = elem.getBoundingClientRect();
    var doc = elem.ownerDocument;
    var docElem = doc.documentElement;
    var pageOffset = getPageOffset(doc);
    // getBoundingClientRect contains left scroll in Chrome on Android.
    // I haven't found a feature detection that proves this. Worst case
    // scenario on mis-match: the 'tap' feature on horizontal sliders breaks.
    if (/webkit.*Chrome.*Mobile/i.test(navigator.userAgent)) {
      pageOffset.x = 0;
    }
    return orientation
      ? rect.top + pageOffset.y - docElem.clientTop
      : rect.left + pageOffset.x - docElem.clientLeft;
  }
  // Checks whether a value is numerical.
  function isNumeric(a) {
    return typeof a === "number" && !isNaN(a) && isFinite(a);
  }
  // Sets a class and removes it after [duration] ms.
  function addClassFor(element, className, duration) {
    if (duration > 0) {
      addClass(element, className);
      setTimeout(function () {
        removeClass(element, className);
      }, duration);
    }
  }
  // Limits a value to 0 - 100
  function limit(a) {
    return Math.max(Math.min(a, 100), 0);
  }
  // Wraps a variable as an array, if it isn't one yet.
  // Note that an input array is returned by reference!
  function asArray(a) {
    return Array.isArray(a) ? a : [a];
  }
  // Counts decimals
  function countDecimals(numStr) {
    numStr = String(numStr);
    var pieces = numStr.split(".");
    return pieces.length > 1 ? pieces[1].length : 0;
  }
  // http://youmightnotneedjquery.com/#add_class
  function addClass(el, className) {
    if (el.classList && !/\s/.test(className)) {
      el.classList.add(className);
    } else {
      el.className += " " + className;
    }
  }
  // http://youmightnotneedjquery.com/#remove_class
  function removeClass(el, className) {
    if (el.classList && !/\s/.test(className)) {
      el.classList.remove(className);
    } else {
      el.className = el.className.replace(
        new RegExp(
          "(^|\\b)" + className.split(" ").join("|") + "(\\b|$)",
          "gi",
        ),
        " ",
      );
    }
  }
  // https://plainjs.com/javascript/attributes/adding-removing-and-testing-for-classes-9/
  function hasClass(el, className) {
    return el.classList
      ? el.classList.contains(className)
      : new RegExp("\\b" + className + "\\b").test(el.className);
  }
  // https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY#Notes
  function getPageOffset(doc) {
    var supportPageOffset = window.pageXOffset !== undefined;
    var isCSS1Compat = (doc.compatMode || "") === "CSS1Compat";
    var x = supportPageOffset
      ? window.pageXOffset
      : isCSS1Compat
        ? doc.documentElement.scrollLeft
        : doc.body.scrollLeft;
    var y = supportPageOffset
      ? window.pageYOffset
      : isCSS1Compat
        ? doc.documentElement.scrollTop
        : doc.body.scrollTop;
    return {
      x: x,
      y: y,
    };
  }
  // we provide a function to compute constants instead
  // of accessing window.* as soon as the module needs it
  // so that we do not compute anything if not needed
  function getActions() {
    // Determine the events to bind. IE11 implements pointerEvents without
    // a prefix, which breaks compatibility with the IE10 implementation.
    return window.navigator.pointerEnabled
      ? {
          start: "pointerdown",
          move: "pointermove",
          end: "pointerup",
        }
      : window.navigator.msPointerEnabled
        ? {
            start: "MSPointerDown",
            move: "MSPointerMove",
            end: "MSPointerUp",
          }
        : {
            start: "mousedown touchstart",
            move: "mousemove touchmove",
            end: "mouseup touchend",
          };
  }
  // https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
  // Issue #785
  function getSupportsPassive() {
    var supportsPassive = false;
    /* eslint-disable */
    try {
      var opts = Object.defineProperty({}, "passive", {
        get: function () {
          supportsPassive = true;
        },
      });
      // @ts-ignore
      window.addEventListener("test", null, opts);
    } catch (e) {}
    /* eslint-enable */
    return supportsPassive;
  }
  function getSupportsTouchActionNone() {
    return window.CSS && CSS.supports && CSS.supports("touch-action", "none");
  }
  //endregion
  //region Range Calculation
  // Determine the size of a sub-range in relation to a full range.
  function subRangeRatio(pa, pb) {
    return 100 / (pb - pa);
  }
  // (percentage) How many percent is this value of this range?
  function fromPercentage(range, value, startRange) {
    return (value * 100) / (range[startRange + 1] - range[startRange]);
  }
  // (percentage) Where is this value on this range?
  function toPercentage(range, value) {
    return fromPercentage(
      range,
      range[0] < 0 ? value + Math.abs(range[0]) : value - range[0],
      0,
    );
  }
  // (value) How much is this percentage on this range?
  function isPercentage(range, value) {
    return (value * (range[1] - range[0])) / 100 + range[0];
  }
  function getJ(value, arr) {
    var j = 1;
    while (value >= arr[j]) {
      j += 1;
    }
    return j;
  }
  // (percentage) Input a value, find where, on a scale of 0-100, it applies.
  function toStepping(xVal, xPct, value) {
    if (value >= xVal.slice(-1)[0]) {
      return 100;
    }
    var j = getJ(value, xVal);
    var va = xVal[j - 1];
    var vb = xVal[j];
    var pa = xPct[j - 1];
    var pb = xPct[j];
    return pa + toPercentage([va, vb], value) / subRangeRatio(pa, pb);
  }
  // (value) Input a percentage, find where it is on the specified range.
  function fromStepping(xVal, xPct, value) {
    // There is no range group that fits 100
    if (value >= 100) {
      return xVal.slice(-1)[0];
    }
    var j = getJ(value, xPct);
    var va = xVal[j - 1];
    var vb = xVal[j];
    var pa = xPct[j - 1];
    var pb = xPct[j];
    return isPercentage([va, vb], (value - pa) * subRangeRatio(pa, pb));
  }
  // (percentage) Get the step that applies at a certain value.
  function getStep(xPct, xSteps, snap, value) {
    if (value === 100) {
      return value;
    }
    var j = getJ(value, xPct);
    var a = xPct[j - 1];
    var b = xPct[j];
    // If 'snap' is set, steps are used as fixed points on the slider.
    if (snap) {
      // Find the closest position, a or b.
      if (value - a > (b - a) / 2) {
        return b;
      }
      return a;
    }
    if (!xSteps[j - 1]) {
      return value;
    }
    return xPct[j - 1] + closest(value - xPct[j - 1], xSteps[j - 1]);
  }
  //endregion
  //region Spectrum
  var Spectrum = /** @class */ (function () {
    function Spectrum(entry, snap, singleStep) {
      this.xPct = [];
      this.xVal = [];
      this.xSteps = [];
      this.xNumSteps = [];
      this.xHighestCompleteStep = [];
      this.xSteps = [singleStep || false];
      this.xNumSteps = [false];
      this.snap = snap;
      var index;
      var ordered = [];
      // Map the object keys to an array.
      Object.keys(entry).forEach(function (index) {
        ordered.push([asArray(entry[index]), index]);
      });
      // Sort all entries by value (numeric sort).
      ordered.sort(function (a, b) {
        return a[0][0] - b[0][0];
      });
      // Convert all entries to subranges.
      for (index = 0; index < ordered.length; index++) {
        this.handleEntryPoint(ordered[index][1], ordered[index][0]);
      }
      // Store the actual step values.
      // xSteps is sorted in the same order as xPct and xVal.
      this.xNumSteps = this.xSteps.slice(0);
      // Convert all numeric steps to the percentage of the subrange they represent.
      for (index = 0; index < this.xNumSteps.length; index++) {
        this.handleStepPoint(index, this.xNumSteps[index]);
      }
    }
    Spectrum.prototype.getDistance = function (value) {
      var distances = [];
      for (var index = 0; index < this.xNumSteps.length - 1; index++) {
        distances[index] = fromPercentage(this.xVal, value, index);
      }
      return distances;
    };
    // Calculate the percentual distance over the whole scale of ranges.
    // direction: 0 = backwards / 1 = forwards
    Spectrum.prototype.getAbsoluteDistance = function (
      value,
      distances,
      direction,
    ) {
      var xPct_index = 0;
      // Calculate range where to start calculation
      if (value < this.xPct[this.xPct.length - 1]) {
        while (value > this.xPct[xPct_index + 1]) {
          xPct_index++;
        }
      } else if (value === this.xPct[this.xPct.length - 1]) {
        xPct_index = this.xPct.length - 2;
      }
      // If looking backwards and the value is exactly at a range separator then look one range further
      if (!direction && value === this.xPct[xPct_index + 1]) {
        xPct_index++;
      }
      if (distances === null) {
        distances = [];
      }
      var start_factor;
      var rest_factor = 1;
      var rest_rel_distance = distances[xPct_index];
      var range_pct = 0;
      var rel_range_distance = 0;
      var abs_distance_counter = 0;
      var range_counter = 0;
      // Calculate what part of the start range the value is
      if (direction) {
        start_factor =
          (value - this.xPct[xPct_index]) /
          (this.xPct[xPct_index + 1] - this.xPct[xPct_index]);
      } else {
        start_factor =
          (this.xPct[xPct_index + 1] - value) /
          (this.xPct[xPct_index + 1] - this.xPct[xPct_index]);
      }
      // Do until the complete distance across ranges is calculated
      while (rest_rel_distance > 0) {
        // Calculate the percentage of total range
        range_pct =
          this.xPct[xPct_index + 1 + range_counter] -
          this.xPct[xPct_index + range_counter];
        // Detect if the margin, padding or limit is larger then the current range and calculate
        if (
          distances[xPct_index + range_counter] * rest_factor +
            100 -
            start_factor * 100 >
          100
        ) {
          // If larger then take the percentual distance of the whole range
          rel_range_distance = range_pct * start_factor;
          // Rest factor of relative percentual distance still to be calculated
          rest_factor =
            (rest_rel_distance - 100 * start_factor) /
            distances[xPct_index + range_counter];
          // Set start factor to 1 as for next range it does not apply.
          start_factor = 1;
        } else {
          // If smaller or equal then take the percentual distance of the calculate percentual part of that range
          rel_range_distance =
            ((distances[xPct_index + range_counter] * range_pct) / 100) *
            rest_factor;
          // No rest left as the rest fits in current range
          rest_factor = 0;
        }
        if (direction) {
          abs_distance_counter = abs_distance_counter - rel_range_distance;
          // Limit range to first range when distance becomes outside of minimum range
          if (this.xPct.length + range_counter >= 1) {
            range_counter--;
          }
        } else {
          abs_distance_counter = abs_distance_counter + rel_range_distance;
          // Limit range to last range when distance becomes outside of maximum range
          if (this.xPct.length - range_counter >= 1) {
            range_counter++;
          }
        }
        // Rest of relative percentual distance still to be calculated
        rest_rel_distance = distances[xPct_index + range_counter] * rest_factor;
      }
      return value + abs_distance_counter;
    };
    Spectrum.prototype.toStepping = function (value) {
      value = toStepping(this.xVal, this.xPct, value);
      return value;
    };
    Spectrum.prototype.fromStepping = function (value) {
      return fromStepping(this.xVal, this.xPct, value);
    };
    Spectrum.prototype.getStep = function (value) {
      value = getStep(this.xPct, this.xSteps, this.snap, value);
      return value;
    };
    Spectrum.prototype.getDefaultStep = function (value, isDown, size) {
      var j = getJ(value, this.xPct);
      // When at the top or stepping down, look at the previous sub-range
      if (value === 100 || (isDown && value === this.xPct[j - 1])) {
        j = Math.max(j - 1, 1);
      }
      return (this.xVal[j] - this.xVal[j - 1]) / size;
    };
    Spectrum.prototype.getNearbySteps = function (value) {
      var j = getJ(value, this.xPct);
      return {
        stepBefore: {
          startValue: this.xVal[j - 2],
          step: this.xNumSteps[j - 2],
          highestStep: this.xHighestCompleteStep[j - 2],
        },
        thisStep: {
          startValue: this.xVal[j - 1],
          step: this.xNumSteps[j - 1],
          highestStep: this.xHighestCompleteStep[j - 1],
        },
        stepAfter: {
          startValue: this.xVal[j],
          step: this.xNumSteps[j],
          highestStep: this.xHighestCompleteStep[j],
        },
      };
    };
    Spectrum.prototype.countStepDecimals = function () {
      var stepDecimals = this.xNumSteps.map(countDecimals);
      return Math.max.apply(null, stepDecimals);
    };
    Spectrum.prototype.hasNoSize = function () {
      return this.xVal[0] === this.xVal[this.xVal.length - 1];
    };
    // Outside testing
    Spectrum.prototype.convert = function (value) {
      return this.getStep(this.toStepping(value));
    };
    Spectrum.prototype.handleEntryPoint = function (index, value) {
      var percentage;
      // Covert min/max syntax to 0 and 100.
      if (index === "min") {
        percentage = 0;
      } else if (index === "max") {
        percentage = 100;
      } else {
        percentage = parseFloat(index);
      }
      // Check for correct input.
      if (!isNumeric(percentage) || !isNumeric(value[0])) {
        throw new Error("noUiSlider: 'range' value isn't numeric.");
      }
      // Store values.
      this.xPct.push(percentage);
      this.xVal.push(value[0]);
      var value1 = Number(value[1]);
      // NaN will evaluate to false too, but to keep
      // logging clear, set step explicitly. Make sure
      // not to override the 'step' setting with false.
      if (!percentage) {
        if (!isNaN(value1)) {
          this.xSteps[0] = value1;
        }
      } else {
        this.xSteps.push(isNaN(value1) ? false : value1);
      }
      this.xHighestCompleteStep.push(0);
    };
    Spectrum.prototype.handleStepPoint = function (i, n) {
      // Ignore 'false' stepping.
      if (!n) {
        return;
      }
      // Step over zero-length ranges (#948);
      if (this.xVal[i] === this.xVal[i + 1]) {
        this.xSteps[i] = this.xHighestCompleteStep[i] = this.xVal[i];
        return;
      }
      // Factor to range ratio
      this.xSteps[i] =
        fromPercentage([this.xVal[i], this.xVal[i + 1]], n, 0) /
        subRangeRatio(this.xPct[i], this.xPct[i + 1]);
      var totalSteps = (this.xVal[i + 1] - this.xVal[i]) / this.xNumSteps[i];
      var highestStep = Math.ceil(Number(totalSteps.toFixed(3)) - 1);
      var step = this.xVal[i] + this.xNumSteps[i] * highestStep;
      this.xHighestCompleteStep[i] = step;
    };
    return Spectrum;
  })();
  //endregion
  //region Options
  /*	Every input option is tested and parsed. This will prevent
    endless validation in internal methods. These tests are
    structured with an item for every option available. An
    option can be marked as required by setting the 'r' flag.
    The testing function is provided with three arguments:
        - The provided value for the option;
        - A reference to the options object;
        - The name for the option;

    The testing function returns false when an error is detected,
    or true when everything is OK. It can also modify the option
    object, to make sure all values can be correctly looped elsewhere. */
  //region Defaults
  var defaultFormatter = {
    to: function (value) {
      return value === undefined ? "" : value.toFixed(2);
    },
    from: Number,
  };
  var cssClasses = {
    target: "target",
    base: "base",
    origin: "origin",
    handle: "handle",
    handleLower: "handle-lower",
    handleUpper: "handle-upper",
    touchArea: "touch-area",
    horizontal: "horizontal",
    vertical: "vertical",
    background: "background",
    connect: "connect",
    connects: "connects",
    ltr: "ltr",
    rtl: "rtl",
    textDirectionLtr: "txt-dir-ltr",
    textDirectionRtl: "txt-dir-rtl",
    draggable: "draggable",
    drag: "state-drag",
    tap: "state-tap",
    active: "active",
    tooltip: "tooltip",
    pips: "pips",
    pipsHorizontal: "pips-horizontal",
    pipsVertical: "pips-vertical",
    marker: "marker",
    markerHorizontal: "marker-horizontal",
    markerVertical: "marker-vertical",
    markerNormal: "marker-normal",
    markerLarge: "marker-large",
    markerSub: "marker-sub",
    value: "value",
    valueHorizontal: "value-horizontal",
    valueVertical: "value-vertical",
    valueNormal: "value-normal",
    valueLarge: "value-large",
    valueSub: "value-sub",
  };
  // Namespaces of internal event listeners
  var INTERNAL_EVENT_NS = {
    tooltips: ".__tooltips",
    aria: ".__aria",
  };
  //endregion
  function testStep(parsed, entry) {
    if (!isNumeric(entry)) {
      throw new Error("noUiSlider: 'step' is not numeric.");
    }
    // The step option can still be used to set stepping
    // for linear sliders. Overwritten if set in 'range'.
    parsed.singleStep = entry;
  }
  function testKeyboardPageMultiplier(parsed, entry) {
    if (!isNumeric(entry)) {
      throw new Error("noUiSlider: 'keyboardPageMultiplier' is not numeric.");
    }
    parsed.keyboardPageMultiplier = entry;
  }
  function testKeyboardMultiplier(parsed, entry) {
    if (!isNumeric(entry)) {
      throw new Error("noUiSlider: 'keyboardMultiplier' is not numeric.");
    }
    parsed.keyboardMultiplier = entry;
  }
  function testKeyboardDefaultStep(parsed, entry) {
    if (!isNumeric(entry)) {
      throw new Error("noUiSlider: 'keyboardDefaultStep' is not numeric.");
    }
    parsed.keyboardDefaultStep = entry;
  }
  function testRange(parsed, entry) {
    // Filter incorrect input.
    if (typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error("noUiSlider: 'range' is not an object.");
    }
    // Catch missing start or end.
    if (entry.min === undefined || entry.max === undefined) {
      throw new Error("noUiSlider: Missing 'min' or 'max' in 'range'.");
    }
    parsed.spectrum = new Spectrum(
      entry,
      parsed.snap || false,
      parsed.singleStep,
    );
  }
  function testStart(parsed, entry) {
    entry = asArray(entry);
    // Validate input. Values aren't tested, as the public .val method
    // will always provide a valid location.
    if (!Array.isArray(entry) || !entry.length) {
      throw new Error("noUiSlider: 'start' option is incorrect.");
    }
    // Store the number of handles.
    parsed.handles = entry.length;
    // When the slider is initialized, the .val method will
    // be called with the start options.
    parsed.start = entry;
  }
  function testSnap(parsed, entry) {
    if (typeof entry !== "boolean") {
      throw new Error("noUiSlider: 'snap' option must be a boolean.");
    }
    // Enforce 100% stepping within subranges.
    parsed.snap = entry;
  }
  function testAnimate(parsed, entry) {
    if (typeof entry !== "boolean") {
      throw new Error("noUiSlider: 'animate' option must be a boolean.");
    }
    // Enforce 100% stepping within subranges.
    parsed.animate = entry;
  }
  function testAnimationDuration(parsed, entry) {
    if (typeof entry !== "number") {
      throw new Error(
        "noUiSlider: 'animationDuration' option must be a number.",
      );
    }
    parsed.animationDuration = entry;
  }
  function testConnect(parsed, entry) {
    var connect = [false];
    var i;
    // Map legacy options
    if (entry === "lower") {
      entry = [true, false];
    } else if (entry === "upper") {
      entry = [false, true];
    }
    // Handle boolean options
    if (entry === true || entry === false) {
      for (i = 1; i < parsed.handles; i++) {
        connect.push(entry);
      }
      connect.push(false);
    }
    // Reject invalid input
    else if (
      !Array.isArray(entry) ||
      !entry.length ||
      entry.length !== parsed.handles + 1
    ) {
      throw new Error(
        "noUiSlider: 'connect' option doesn't match handle count.",
      );
    } else {
      connect = entry;
    }
    parsed.connect = connect;
  }
  function testOrientation(parsed, entry) {
    // Set orientation to an a numerical value for easy
    // array selection.
    switch (entry) {
      case "horizontal":
        parsed.ort = 0;
        break;
      case "vertical":
        parsed.ort = 1;
        break;
      default:
        throw new Error("noUiSlider: 'orientation' option is invalid.");
    }
  }
  function testMargin(parsed, entry) {
    if (!isNumeric(entry)) {
      throw new Error("noUiSlider: 'margin' option must be numeric.");
    }
    // Issue #582
    if (entry === 0) {
      return;
    }
    parsed.margin = parsed.spectrum.getDistance(entry);
  }
  function testLimit(parsed, entry) {
    if (!isNumeric(entry)) {
      throw new Error("noUiSlider: 'limit' option must be numeric.");
    }
    parsed.limit = parsed.spectrum.getDistance(entry);
    if (!parsed.limit || parsed.handles < 2) {
      throw new Error(
        "noUiSlider: 'limit' option is only supported on linear sliders with 2 or more handles.",
      );
    }
  }
  function testPadding(parsed, entry) {
    var index;
    if (!isNumeric(entry) && !Array.isArray(entry)) {
      throw new Error(
        "noUiSlider: 'padding' option must be numeric or array of exactly 2 numbers.",
      );
    }
    if (
      Array.isArray(entry) &&
      !(entry.length === 2 || isNumeric(entry[0]) || isNumeric(entry[1]))
    ) {
      throw new Error(
        "noUiSlider: 'padding' option must be numeric or array of exactly 2 numbers.",
      );
    }
    if (entry === 0) {
      return;
    }
    if (!Array.isArray(entry)) {
      entry = [entry, entry];
    }
    // 'getDistance' returns false for invalid values.
    parsed.padding = [
      parsed.spectrum.getDistance(entry[0]),
      parsed.spectrum.getDistance(entry[1]),
    ];
    for (index = 0; index < parsed.spectrum.xNumSteps.length - 1; index++) {
      // last "range" can't contain step size as it is purely an endpoint.
      if (parsed.padding[0][index] < 0 || parsed.padding[1][index] < 0) {
        throw new Error(
          "noUiSlider: 'padding' option must be a positive number(s).",
        );
      }
    }
    var totalPadding = entry[0] + entry[1];
    var firstValue = parsed.spectrum.xVal[0];
    var lastValue = parsed.spectrum.xVal[parsed.spectrum.xVal.length - 1];
    if (totalPadding / (lastValue - firstValue) > 1) {
      throw new Error(
        "noUiSlider: 'padding' option must not exceed 100% of the range.",
      );
    }
  }
  function testDirection(parsed, entry) {
    // Set direction as a numerical value for easy parsing.
    // Invert connection for RTL sliders, so that the proper
    // handles get the connect/background classes.
    switch (entry) {
      case "ltr":
        parsed.dir = 0;
        break;
      case "rtl":
        parsed.dir = 1;
        break;
      default:
        throw new Error("noUiSlider: 'direction' option was not recognized.");
    }
  }
  function testBehaviour(parsed, entry) {
    // Make sure the input is a string.
    if (typeof entry !== "string") {
      throw new Error(
        "noUiSlider: 'behaviour' must be a string containing options.",
      );
    }
    // Check if the string contains any keywords.
    // None are required.
    var tap = entry.indexOf("tap") >= 0;
    var drag = entry.indexOf("drag") >= 0;
    var fixed = entry.indexOf("fixed") >= 0;
    var snap = entry.indexOf("snap") >= 0;
    var hover = entry.indexOf("hover") >= 0;
    var unconstrained = entry.indexOf("unconstrained") >= 0;
    var dragAll = entry.indexOf("drag-all") >= 0;
    var smoothSteps = entry.indexOf("smooth-steps") >= 0;
    if (fixed) {
      if (parsed.handles !== 2) {
        throw new Error(
          "noUiSlider: 'fixed' behaviour must be used with 2 handles",
        );
      }
      // Use margin to enforce fixed state
      testMargin(parsed, parsed.start[1] - parsed.start[0]);
    }
    if (unconstrained && (parsed.margin || parsed.limit)) {
      throw new Error(
        "noUiSlider: 'unconstrained' behaviour cannot be used with margin or limit",
      );
    }
    parsed.events = {
      tap: tap || snap,
      drag: drag,
      dragAll: dragAll,
      smoothSteps: smoothSteps,
      fixed: fixed,
      snap: snap,
      hover: hover,
      unconstrained: unconstrained,
    };
  }
  function testTooltips(parsed, entry) {
    if (entry === false) {
      return;
    }
    if (entry === true || isValidPartialFormatter(entry)) {
      parsed.tooltips = [];
      for (var i = 0; i < parsed.handles; i++) {
        parsed.tooltips.push(entry);
      }
    } else {
      entry = asArray(entry);
      if (entry.length !== parsed.handles) {
        throw new Error("noUiSlider: must pass a formatter for all handles.");
      }
      entry.forEach(function (formatter) {
        if (
          typeof formatter !== "boolean" &&
          !isValidPartialFormatter(formatter)
        ) {
          throw new Error(
            "noUiSlider: 'tooltips' must be passed a formatter or 'false'.",
          );
        }
      });
      parsed.tooltips = entry;
    }
  }
  function testHandleAttributes(parsed, entry) {
    if (entry.length !== parsed.handles) {
      throw new Error("noUiSlider: must pass a attributes for all handles.");
    }
    parsed.handleAttributes = entry;
  }
  function testAriaFormat(parsed, entry) {
    if (!isValidPartialFormatter(entry)) {
      throw new Error("noUiSlider: 'ariaFormat' requires 'to' method.");
    }
    parsed.ariaFormat = entry;
  }
  function testFormat(parsed, entry) {
    if (!isValidFormatter(entry)) {
      throw new Error("noUiSlider: 'format' requires 'to' and 'from' methods.");
    }
    parsed.format = entry;
  }
  function testKeyboardSupport(parsed, entry) {
    if (typeof entry !== "boolean") {
      throw new Error(
        "noUiSlider: 'keyboardSupport' option must be a boolean.",
      );
    }
    parsed.keyboardSupport = entry;
  }
  function testDocumentElement(parsed, entry) {
    // This is an advanced option. Passed values are used without validation.
    parsed.documentElement = entry;
  }
  function testCssPrefix(parsed, entry) {
    if (typeof entry !== "string" && entry !== false) {
      throw new Error("noUiSlider: 'cssPrefix' must be a string or `false`.");
    }
    parsed.cssPrefix = entry;
  }
  function testCssClasses(parsed, entry) {
    if (typeof entry !== "object") {
      throw new Error("noUiSlider: 'cssClasses' must be an object.");
    }
    if (typeof parsed.cssPrefix === "string") {
      parsed.cssClasses = {};
      Object.keys(entry).forEach(function (key) {
        parsed.cssClasses[key] = parsed.cssPrefix + entry[key];
      });
    } else {
      parsed.cssClasses = entry;
    }
  }
  // Test all developer settings and parse to assumption-safe values.
  function testOptions(options) {
    // To prove a fix for #537, freeze options here.
    // If the object is modified, an error will be thrown.
    // Object.freeze(options);
    var parsed = {
      margin: null,
      limit: null,
      padding: null,
      animate: true,
      animationDuration: 300,
      ariaFormat: defaultFormatter,
      format: defaultFormatter,
    };
    // Tests are executed in the order they are presented here.
    var tests = {
      step: { r: false, t: testStep },
      keyboardPageMultiplier: { r: false, t: testKeyboardPageMultiplier },
      keyboardMultiplier: { r: false, t: testKeyboardMultiplier },
      keyboardDefaultStep: { r: false, t: testKeyboardDefaultStep },
      start: { r: true, t: testStart },
      connect: { r: true, t: testConnect },
      direction: { r: true, t: testDirection },
      snap: { r: false, t: testSnap },
      animate: { r: false, t: testAnimate },
      animationDuration: { r: false, t: testAnimationDuration },
      range: { r: true, t: testRange },
      orientation: { r: false, t: testOrientation },
      margin: { r: false, t: testMargin },
      limit: { r: false, t: testLimit },
      padding: { r: false, t: testPadding },
      behaviour: { r: true, t: testBehaviour },
      ariaFormat: { r: false, t: testAriaFormat },
      format: { r: false, t: testFormat },
      tooltips: { r: false, t: testTooltips },
      keyboardSupport: { r: true, t: testKeyboardSupport },
      documentElement: { r: false, t: testDocumentElement },
      cssPrefix: { r: true, t: testCssPrefix },
      cssClasses: { r: true, t: testCssClasses },
      handleAttributes: { r: false, t: testHandleAttributes },
    };
    var defaults = {
      connect: false,
      direction: "ltr",
      behaviour: "tap",
      orientation: "horizontal",
      keyboardSupport: true,
      cssPrefix: "noUi-",
      cssClasses: cssClasses,
      keyboardPageMultiplier: 5,
      keyboardMultiplier: 1,
      keyboardDefaultStep: 10,
    };
    // AriaFormat defaults to regular format, if any.
    if (options.format && !options.ariaFormat) {
      options.ariaFormat = options.format;
    }
    // Run all options through a testing mechanism to ensure correct
    // input. It should be noted that options might get modified to
    // be handled properly. E.g. wrapping integers in arrays.
    Object.keys(tests).forEach(function (name) {
      // If the option isn't set, but it is required, throw an error.
      if (!isSet(options[name]) && defaults[name] === undefined) {
        if (tests[name].r) {
          throw new Error("noUiSlider: '" + name + "' is required.");
        }
        return;
      }
      tests[name].t(
        parsed,
        !isSet(options[name]) ? defaults[name] : options[name],
      );
    });
    // Forward pips options
    parsed.pips = options.pips;
    // All recent browsers accept unprefixed transform.
    // We need -ms- for IE9 and -webkit- for older Android;
    // Assume use of -webkit- if unprefixed and -ms- are not supported.
    // https://caniuse.com/#feat=transforms2d
    var d = document.createElement("div");
    var msPrefix = d.style.msTransform !== undefined;
    var noPrefix = d.style.transform !== undefined;
    parsed.transformRule = noPrefix
      ? "transform"
      : msPrefix
        ? "msTransform"
        : "webkitTransform";
    // Pips don't move, so we can place them using left/top.
    var styles = [
      ["left", "top"],
      ["right", "bottom"],
    ];
    parsed.style = styles[parsed.dir][parsed.ort];
    return parsed;
  }
  //endregion
  function scope(target, options, originalOptions) {
    var actions = getActions();
    var supportsTouchActionNone = getSupportsTouchActionNone();
    var supportsPassive = supportsTouchActionNone && getSupportsPassive();
    // All variables local to 'scope' are prefixed with 'scope_'
    // Slider DOM Nodes
    var scope_Target = target;
    var scope_Base;
    var scope_Handles;
    var scope_Connects;
    var scope_Pips;
    var scope_Tooltips;
    // Slider state values
    var scope_Spectrum = options.spectrum;
    var scope_Values = [];
    var scope_Locations = [];
    var scope_HandleNumbers = [];
    var scope_ActiveHandlesCount = 0;
    var scope_Events = {};
    // Document Nodes
    var scope_Document = target.ownerDocument;
    var scope_DocumentElement =
      options.documentElement || scope_Document.documentElement;
    var scope_Body = scope_Document.body;
    // For horizontal sliders in standard ltr documents,
    // make .noUi-origin overflow to the left so the document doesn't scroll.
    var scope_DirOffset =
      scope_Document.dir === "rtl" || options.ort === 1 ? 0 : 100;
    // Creates a node, adds it to target, returns the new node.
    function addNodeTo(addTarget, className) {
      var div = scope_Document.createElement("div");
      if (className) {
        addClass(div, className);
      }
      addTarget.appendChild(div);
      return div;
    }
    // Append a origin to the base
    function addOrigin(base, handleNumber) {
      var origin = addNodeTo(base, options.cssClasses.origin);
      var handle = addNodeTo(origin, options.cssClasses.handle);
      addNodeTo(handle, options.cssClasses.touchArea);
      handle.setAttribute("data-handle", String(handleNumber));
      if (options.keyboardSupport) {
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
        // 0 = focusable and reachable
        handle.setAttribute("tabindex", "0");
        handle.addEventListener("keydown", function (event) {
          return eventKeydown(event, handleNumber);
        });
      }
      if (options.handleAttributes !== undefined) {
        var attributes_1 = options.handleAttributes[handleNumber];
        Object.keys(attributes_1).forEach(function (attribute) {
          handle.setAttribute(attribute, attributes_1[attribute]);
        });
      }
      handle.setAttribute("role", "slider");
      handle.setAttribute(
        "aria-orientation",
        options.ort ? "vertical" : "horizontal",
      );
      if (handleNumber === 0) {
        addClass(handle, options.cssClasses.handleLower);
      } else if (handleNumber === options.handles - 1) {
        addClass(handle, options.cssClasses.handleUpper);
      }
      origin.handle = handle;
      return origin;
    }
    // Insert nodes for connect elements
    function addConnect(base, add) {
      if (!add) {
        return false;
      }
      return addNodeTo(base, options.cssClasses.connect);
    }
    // Add handles to the slider base.
    function addElements(connectOptions, base) {
      var connectBase = addNodeTo(base, options.cssClasses.connects);
      scope_Handles = [];
      scope_Connects = [];
      scope_Connects.push(addConnect(connectBase, connectOptions[0]));
      // [::::O====O====O====]
      // connectOptions = [0, 1, 1, 1]
      for (var i = 0; i < options.handles; i++) {
        // Keep a list of all added handles.
        scope_Handles.push(addOrigin(base, i));
        scope_HandleNumbers[i] = i;
        scope_Connects.push(addConnect(connectBase, connectOptions[i + 1]));
      }
    }
    // Initialize a single slider.
    function addSlider(addTarget) {
      // Apply classes and data to the target.
      addClass(addTarget, options.cssClasses.target);
      if (options.dir === 0) {
        addClass(addTarget, options.cssClasses.ltr);
      } else {
        addClass(addTarget, options.cssClasses.rtl);
      }
      if (options.ort === 0) {
        addClass(addTarget, options.cssClasses.horizontal);
      } else {
        addClass(addTarget, options.cssClasses.vertical);
      }
      var textDirection = getComputedStyle(addTarget).direction;
      if (textDirection === "rtl") {
        addClass(addTarget, options.cssClasses.textDirectionRtl);
      } else {
        addClass(addTarget, options.cssClasses.textDirectionLtr);
      }
      return addNodeTo(addTarget, options.cssClasses.base);
    }
    function addTooltip(handle, handleNumber) {
      if (!options.tooltips || !options.tooltips[handleNumber]) {
        return false;
      }
      return addNodeTo(handle.firstChild, options.cssClasses.tooltip);
    }
    function isSliderDisabled() {
      return scope_Target.hasAttribute("disabled");
    }
    // Disable the slider dragging if any handle is disabled
    function isHandleDisabled(handleNumber) {
      var handleOrigin = scope_Handles[handleNumber];
      return handleOrigin.hasAttribute("disabled");
    }
    function disable(handleNumber) {
      if (handleNumber !== null && handleNumber !== undefined) {
        scope_Handles[handleNumber].setAttribute("disabled", "");
        scope_Handles[handleNumber].handle.removeAttribute("tabindex");
      } else {
        scope_Target.setAttribute("disabled", "");
        scope_Handles.forEach(function (handle) {
          handle.handle.removeAttribute("tabindex");
        });
      }
    }
    function enable(handleNumber) {
      if (handleNumber !== null && handleNumber !== undefined) {
        scope_Handles[handleNumber].removeAttribute("disabled");
        scope_Handles[handleNumber].handle.setAttribute("tabindex", "0");
      } else {
        scope_Target.removeAttribute("disabled");
        scope_Handles.forEach(function (handle) {
          handle.removeAttribute("disabled");
          handle.handle.setAttribute("tabindex", "0");
        });
      }
    }
    function removeTooltips() {
      if (scope_Tooltips) {
        removeEvent("update" + INTERNAL_EVENT_NS.tooltips);
        scope_Tooltips.forEach(function (tooltip) {
          if (tooltip) {
            removeElement(tooltip);
          }
        });
        scope_Tooltips = null;
      }
    }
    // The tooltips option is a shorthand for using the 'update' event.
    function tooltips() {
      removeTooltips();
      // Tooltips are added with options.tooltips in original order.
      scope_Tooltips = scope_Handles.map(addTooltip);
      bindEvent(
        "update" + INTERNAL_EVENT_NS.tooltips,
        function (values, handleNumber, unencoded) {
          if (!scope_Tooltips || !options.tooltips) {
            return;
          }
          if (scope_Tooltips[handleNumber] === false) {
            return;
          }
          var formattedValue = values[handleNumber];
          if (options.tooltips[handleNumber] !== true) {
            formattedValue = options.tooltips[handleNumber].to(
              unencoded[handleNumber],
            );
          }
          scope_Tooltips[handleNumber].innerHTML = formattedValue;
        },
      );
    }
    function aria() {
      removeEvent("update" + INTERNAL_EVENT_NS.aria);
      bindEvent(
        "update" + INTERNAL_EVENT_NS.aria,
        function (values, handleNumber, unencoded, tap, positions) {
          // Update Aria Values for all handles, as a change in one changes min and max values for the next.
          scope_HandleNumbers.forEach(function (index) {
            var handle = scope_Handles[index];
            var min = checkHandlePosition(
              scope_Locations,
              index,
              0,
              true,
              true,
              true,
            );
            var max = checkHandlePosition(
              scope_Locations,
              index,
              100,
              true,
              true,
              true,
            );
            var now = positions[index];
            // Formatted value for display
            var text = String(options.ariaFormat.to(unencoded[index]));
            // Map to slider range values
            min = scope_Spectrum.fromStepping(min).toFixed(1);
            max = scope_Spectrum.fromStepping(max).toFixed(1);
            now = scope_Spectrum.fromStepping(now).toFixed(1);
            handle.children[0].setAttribute("aria-valuemin", min);
            handle.children[0].setAttribute("aria-valuemax", max);
            handle.children[0].setAttribute("aria-valuenow", now);
            handle.children[0].setAttribute("aria-valuetext", text);
          });
        },
      );
    }
    function getGroup(pips) {
      // Use the range.
      if (pips.mode === PipsMode.Range || pips.mode === PipsMode.Steps) {
        return scope_Spectrum.xVal;
      }
      if (pips.mode === PipsMode.Count) {
        if (pips.values < 2) {
          throw new Error(
            "noUiSlider: 'values' (>= 2) required for mode 'count'.",
          );
        }
        // Divide 0 - 100 in 'count' parts.
        var interval = pips.values - 1;
        var spread = 100 / interval;
        var values = [];
        // List these parts and have them handled as 'positions'.
        while (interval--) {
          values[interval] = interval * spread;
        }
        values.push(100);
        return mapToRange(values, pips.stepped);
      }
      if (pips.mode === PipsMode.Positions) {
        // Map all percentages to on-range values.
        return mapToRange(pips.values, pips.stepped);
      }
      if (pips.mode === PipsMode.Values) {
        // If the value must be stepped, it needs to be converted to a percentage first.
        if (pips.stepped) {
          return pips.values.map(function (value) {
            // Convert to percentage, apply step, return to value.
            return scope_Spectrum.fromStepping(
              scope_Spectrum.getStep(scope_Spectrum.toStepping(value)),
            );
          });
        }
        // Otherwise, we can simply use the values.
        return pips.values;
      }
      return []; // pips.mode = never
    }
    function mapToRange(values, stepped) {
      return values.map(function (value) {
        return scope_Spectrum.fromStepping(
          stepped ? scope_Spectrum.getStep(value) : value,
        );
      });
    }
    function generateSpread(pips) {
      function safeIncrement(value, increment) {
        // Avoid floating point variance by dropping the smallest decimal places.
        return Number((value + increment).toFixed(7));
      }
      var group = getGroup(pips);
      var indexes = {};
      var firstInRange = scope_Spectrum.xVal[0];
      var lastInRange = scope_Spectrum.xVal[scope_Spectrum.xVal.length - 1];
      var ignoreFirst = false;
      var ignoreLast = false;
      var prevPct = 0;
      // Create a copy of the group, sort it and filter away all duplicates.
      group = unique(
        group.slice().sort(function (a, b) {
          return a - b;
        }),
      );
      // Make sure the range starts with the first element.
      if (group[0] !== firstInRange) {
        group.unshift(firstInRange);
        ignoreFirst = true;
      }
      // Likewise for the last one.
      if (group[group.length - 1] !== lastInRange) {
        group.push(lastInRange);
        ignoreLast = true;
      }
      group.forEach(function (current, index) {
        // Get the current step and the lower + upper positions.
        var step;
        var i;
        var q;
        var low = current;
        var high = group[index + 1];
        var newPct;
        var pctDifference;
        var pctPos;
        var type;
        var steps;
        var realSteps;
        var stepSize;
        var isSteps = pips.mode === PipsMode.Steps;
        // When using 'steps' mode, use the provided steps.
        // Otherwise, we'll step on to the next subrange.
        if (isSteps) {
          step = scope_Spectrum.xNumSteps[index];
        }
        // Default to a 'full' step.
        if (!step) {
          step = high - low;
        }
        // If high is undefined we are at the last subrange. Make sure it iterates once (#1088)
        if (high === undefined) {
          high = low;
        }
        // Make sure step isn't 0, which would cause an infinite loop (#654)
        step = Math.max(step, 0.0000001);
        // Find all steps in the subrange.
        for (i = low; i <= high; i = safeIncrement(i, step)) {
          // Get the percentage value for the current step,
          // calculate the size for the subrange.
          newPct = scope_Spectrum.toStepping(i);
          pctDifference = newPct - prevPct;
          steps = pctDifference / (pips.density || 1);
          realSteps = Math.round(steps);
          // This ratio represents the amount of percentage-space a point indicates.
          // For a density 1 the points/percentage = 1. For density 2, that percentage needs to be re-divided.
          // Round the percentage offset to an even number, then divide by two
          // to spread the offset on both sides of the range.
          stepSize = pctDifference / realSteps;
          // Divide all points evenly, adding the correct number to this subrange.
          // Run up to <= so that 100% gets a point, event if ignoreLast is set.
          for (q = 1; q <= realSteps; q += 1) {
            // The ratio between the rounded value and the actual size might be ~1% off.
            // Correct the percentage offset by the number of points
            // per subrange. density = 1 will result in 100 points on the
            // full range, 2 for 50, 4 for 25, etc.
            pctPos = prevPct + q * stepSize;
            indexes[pctPos.toFixed(5)] = [
              scope_Spectrum.fromStepping(pctPos),
              0,
            ];
          }
          // Determine the point type.
          type =
            group.indexOf(i) > -1
              ? PipsType.LargeValue
              : isSteps
                ? PipsType.SmallValue
                : PipsType.NoValue;
          // Enforce the 'ignoreFirst' option by overwriting the type for 0.
          if (!index && ignoreFirst && i !== high) {
            type = 0;
          }
          if (!(i === high && ignoreLast)) {
            // Mark the 'type' of this point. 0 = plain, 1 = real value, 2 = step value.
            indexes[newPct.toFixed(5)] = [i, type];
          }
          // Update the percentage count.
          prevPct = newPct;
        }
      });
      return indexes;
    }
    function addMarking(spread, filterFunc, formatter) {
      var _a, _b;
      var element = scope_Document.createElement("div");
      var valueSizeClasses =
        ((_a = {}),
        (_a[PipsType.None] = ""),
        (_a[PipsType.NoValue] = options.cssClasses.valueNormal),
        (_a[PipsType.LargeValue] = options.cssClasses.valueLarge),
        (_a[PipsType.SmallValue] = options.cssClasses.valueSub),
        _a);
      var markerSizeClasses =
        ((_b = {}),
        (_b[PipsType.None] = ""),
        (_b[PipsType.NoValue] = options.cssClasses.markerNormal),
        (_b[PipsType.LargeValue] = options.cssClasses.markerLarge),
        (_b[PipsType.SmallValue] = options.cssClasses.markerSub),
        _b);
      var valueOrientationClasses = [
        options.cssClasses.valueHorizontal,
        options.cssClasses.valueVertical,
      ];
      var markerOrientationClasses = [
        options.cssClasses.markerHorizontal,
        options.cssClasses.markerVertical,
      ];
      addClass(element, options.cssClasses.pips);
      addClass(
        element,
        options.ort === 0
          ? options.cssClasses.pipsHorizontal
          : options.cssClasses.pipsVertical,
      );
      function getClasses(type, source) {
        var a = source === options.cssClasses.value;
        var orientationClasses = a
          ? valueOrientationClasses
          : markerOrientationClasses;
        var sizeClasses = a ? valueSizeClasses : markerSizeClasses;
        return (
          source +
          " " +
          orientationClasses[options.ort] +
          " " +
          sizeClasses[type]
        );
      }
      function addSpread(offset, value, type) {
        // Apply the filter function, if it is set.
        type = filterFunc ? filterFunc(value, type) : type;
        if (type === PipsType.None) {
          return;
        }
        // Add a marker for every point
        var node = addNodeTo(element, false);
        node.className = getClasses(type, options.cssClasses.marker);
        node.style[options.style] = offset + "%";
        // Values are only appended for points marked '1' or '2'.
        if (type > PipsType.NoValue) {
          node = addNodeTo(element, false);
          node.className = getClasses(type, options.cssClasses.value);
          node.setAttribute("data-value", String(value));
          node.style[options.style] = offset + "%";
          node.innerHTML = String(formatter.to(value));
        }
      }
      // Append all points.
      Object.keys(spread).forEach(function (offset) {
        addSpread(offset, spread[offset][0], spread[offset][1]);
      });
      return element;
    }
    function removePips() {
      if (scope_Pips) {
        removeElement(scope_Pips);
        scope_Pips = null;
      }
    }
    function pips(pips) {
      // Fix #669
      removePips();
      var spread = generateSpread(pips);
      var filter = pips.filter;
      var format = pips.format || {
        to: function (value) {
          return String(Math.round(value));
        },
      };
      scope_Pips = scope_Target.appendChild(addMarking(spread, filter, format));
      return scope_Pips;
    }
    // Shorthand for base dimensions.
    function baseSize() {
      var rect = scope_Base.getBoundingClientRect();
      var alt = "offset" + ["Width", "Height"][options.ort];
      return options.ort === 0
        ? rect.width || scope_Base[alt]
        : rect.height || scope_Base[alt];
    }
    // Handler for attaching events trough a proxy.
    function attachEvent(events, element, callback, data) {
      // This function can be used to 'filter' events to the slider.
      // element is a node, not a nodeList
      var method = function (event) {
        var e = fixEvent(event, data.pageOffset, data.target || element);
        // fixEvent returns false if this event has a different target
        // when handling (multi-) touch events;
        if (!e) {
          return false;
        }
        // doNotReject is passed by all end events to make sure released touches
        // are not rejected, leaving the slider "stuck" to the cursor;
        if (isSliderDisabled() && !data.doNotReject) {
          return false;
        }
        // Stop if an active 'tap' transition is taking place.
        if (
          hasClass(scope_Target, options.cssClasses.tap) &&
          !data.doNotReject
        ) {
          return false;
        }
        // Ignore right or middle clicks on start #454
        if (
          events === actions.start &&
          e.buttons !== undefined &&
          e.buttons > 1
        ) {
          return false;
        }
        // Ignore right or middle clicks on start #454
        if (data.hover && e.buttons) {
          return false;
        }
        // 'supportsPassive' is only true if a browser also supports touch-action: none in CSS.
        // iOS safari does not, so it doesn't get to benefit from passive scrolling. iOS does support
        // touch-action: manipulation, but that allows panning, which breaks
        // sliders after zooming/on non-responsive pages.
        // See: https://bugs.webkit.org/show_bug.cgi?id=133112
        if (!supportsPassive) {
          e.preventDefault();
        }
        e.calcPoint = e.points[options.ort];
        // Call the event handler with the event [ and additional data ].
        callback(e, data);
        return;
      };
      var methods = [];
      // Bind a closure on the target for every event type.
      events.split(" ").forEach(function (eventName) {
        element.addEventListener(
          eventName,
          method,
          supportsPassive ? { passive: true } : false,
        );
        methods.push([eventName, method]);
      });
      return methods;
    }
    // Provide a clean event with standardized offset values.
    function fixEvent(e, pageOffset, eventTarget) {
      // Filter the event to register the type, which can be
      // touch, mouse or pointer. Offset changes need to be
      // made on an event specific basis.
      var touch = e.type.indexOf("touch") === 0;
      var mouse = e.type.indexOf("mouse") === 0;
      var pointer = e.type.indexOf("pointer") === 0;
      var x = 0;
      var y = 0;
      // IE10 implemented pointer events with a prefix;
      if (e.type.indexOf("MSPointer") === 0) {
        pointer = true;
      }
      // Erroneous events seem to be passed in occasionally on iOS/iPadOS after user finishes interacting with
      // the slider. They appear to be of type MouseEvent, yet they don't have usual properties set. Ignore
      // events that have no touches or buttons associated with them. (#1057, #1079, #1095)
      if (e.type === "mousedown" && !e.buttons && !e.touches) {
        return false;
      }
      // The only thing one handle should be concerned about is the touches that originated on top of it.
      if (touch) {
        // Returns true if a touch originated on the target.
        var isTouchOnTarget = function (checkTouch) {
          var target = checkTouch.target;
          return (
            target === eventTarget ||
            eventTarget.contains(target) ||
            (e.composed && e.composedPath().shift() === eventTarget)
          );
        };
        // In the case of touchstart events, we need to make sure there is still no more than one
        // touch on the target so we look amongst all touches.
        if (e.type === "touchstart") {
          var targetTouches = Array.prototype.filter.call(
            e.touches,
            isTouchOnTarget,
          );
          // Do not support more than one touch per handle.
          if (targetTouches.length > 1) {
            return false;
          }
          x = targetTouches[0].pageX;
          y = targetTouches[0].pageY;
        } else {
          // In the other cases, find on changedTouches is enough.
          var targetTouch = Array.prototype.find.call(
            e.changedTouches,
            isTouchOnTarget,
          );
          // Cancel if the target touch has not moved.
          if (!targetTouch) {
            return false;
          }
          x = targetTouch.pageX;
          y = targetTouch.pageY;
        }
      }
      pageOffset = pageOffset || getPageOffset(scope_Document);
      if (mouse || pointer) {
        x = e.clientX + pageOffset.x;
        y = e.clientY + pageOffset.y;
      }
      e.pageOffset = pageOffset;
      e.points = [x, y];
      e.cursor = mouse || pointer; // Fix #435
      return e;
    }
    // Translate a coordinate in the document to a percentage on the slider
    function calcPointToPercentage(calcPoint) {
      var location = calcPoint - offset(scope_Base, options.ort);
      var proposal = (location * 100) / baseSize();
      // Clamp proposal between 0% and 100%
      // Out-of-bound coordinates may occur when .noUi-base pseudo-elements
      // are used (e.g. contained handles feature)
      proposal = limit(proposal);
      return options.dir ? 100 - proposal : proposal;
    }
    // Find handle closest to a certain percentage on the slider
    function getClosestHandle(clickedPosition) {
      var smallestDifference = 100;
      var handleNumber = false;
      scope_Handles.forEach(function (handle, index) {
        // Disabled handles are ignored
        if (isHandleDisabled(index)) {
          return;
        }
        var handlePosition = scope_Locations[index];
        var differenceWithThisHandle = Math.abs(
          handlePosition - clickedPosition,
        );
        // Initial state
        var clickAtEdge =
          differenceWithThisHandle === 100 && smallestDifference === 100;
        // Difference with this handle is smaller than the previously checked handle
        var isCloser = differenceWithThisHandle < smallestDifference;
        var isCloserAfter =
          differenceWithThisHandle <= smallestDifference &&
          clickedPosition > handlePosition;
        if (isCloser || isCloserAfter || clickAtEdge) {
          handleNumber = index;
          smallestDifference = differenceWithThisHandle;
        }
      });
      return handleNumber;
    }
    // Fire 'end' when a mouse or pen leaves the document.
    function documentLeave(event, data) {
      if (
        event.type === "mouseout" &&
        event.target.nodeName === "HTML" &&
        event.relatedTarget === null
      ) {
        eventEnd(event, data);
      }
    }
    // Handle movement on document for handle and range drag.
    function eventMove(event, data) {
      // Fix #498
      // Check value of .buttons in 'start' to work around a bug in IE10 mobile (data.buttonsProperty).
      // https://connect.microsoft.com/IE/feedback/details/927005/mobile-ie10-windows-phone-buttons-property-of-pointermove-event-always-zero
      // IE9 has .buttons and .which zero on mousemove.
      // Firefox breaks the spec MDN defines.
      if (
        navigator.appVersion.indexOf("MSIE 9") === -1 &&
        event.buttons === 0 &&
        data.buttonsProperty !== 0
      ) {
        return eventEnd(event, data);
      }
      // Check if we are moving up or down
      var movement =
        (options.dir ? -1 : 1) * (event.calcPoint - data.startCalcPoint);
      // Convert the movement into a percentage of the slider width/height
      var proposal = (movement * 100) / data.baseSize;
      moveHandles(
        movement > 0,
        proposal,
        data.locations,
        data.handleNumbers,
        data.connect,
      );
    }
    // Unbind move events on document, call callbacks.
    function eventEnd(event, data) {
      // The handle is no longer active, so remove the class.
      if (data.handle) {
        removeClass(data.handle, options.cssClasses.active);
        scope_ActiveHandlesCount -= 1;
      }
      // Unbind the move and end events, which are added on 'start'.
      data.listeners.forEach(function (c) {
        scope_DocumentElement.removeEventListener(c[0], c[1]);
      });
      if (scope_ActiveHandlesCount === 0) {
        // Remove dragging class.
        removeClass(scope_Target, options.cssClasses.drag);
        setZindex();
        // Remove cursor styles and text-selection events bound to the body.
        if (event.cursor) {
          scope_Body.style.cursor = "";
          scope_Body.removeEventListener("selectstart", preventDefault);
        }
      }
      if (options.events.smoothSteps) {
        data.handleNumbers.forEach(function (handleNumber) {
          setHandle(
            handleNumber,
            scope_Locations[handleNumber],
            true,
            true,
            false,
            false,
          );
        });
        data.handleNumbers.forEach(function (handleNumber) {
          fireEvent("update", handleNumber);
        });
      }
      data.handleNumbers.forEach(function (handleNumber) {
        fireEvent("change", handleNumber);
        fireEvent("set", handleNumber);
        fireEvent("end", handleNumber);
      });
    }
    // Bind move events on document.
    function eventStart(event, data) {
      // Ignore event if any handle is disabled
      if (data.handleNumbers.some(isHandleDisabled)) {
        return;
      }
      var handle;
      if (data.handleNumbers.length === 1) {
        var handleOrigin = scope_Handles[data.handleNumbers[0]];
        handle = handleOrigin.children[0];
        scope_ActiveHandlesCount += 1;
        // Mark the handle as 'active' so it can be styled.
        addClass(handle, options.cssClasses.active);
      }
      // A drag should never propagate up to the 'tap' event.
      event.stopPropagation();
      // Record the event listeners.
      var listeners = [];
      // Attach the move and end events.
      var moveEvent = attachEvent(
        actions.move,
        scope_DocumentElement,
        eventMove,
        {
          // The event target has changed so we need to propagate the original one so that we keep
          // relying on it to extract target touches.
          target: event.target,
          handle: handle,
          connect: data.connect,
          listeners: listeners,
          startCalcPoint: event.calcPoint,
          baseSize: baseSize(),
          pageOffset: event.pageOffset,
          handleNumbers: data.handleNumbers,
          buttonsProperty: event.buttons,
          locations: scope_Locations.slice(),
        },
      );
      var endEvent = attachEvent(actions.end, scope_DocumentElement, eventEnd, {
        target: event.target,
        handle: handle,
        listeners: listeners,
        doNotReject: true,
        handleNumbers: data.handleNumbers,
      });
      var outEvent = attachEvent(
        "mouseout",
        scope_DocumentElement,
        documentLeave,
        {
          target: event.target,
          handle: handle,
          listeners: listeners,
          doNotReject: true,
          handleNumbers: data.handleNumbers,
        },
      );
      // We want to make sure we pushed the listeners in the listener list rather than creating
      // a new one as it has already been passed to the event handlers.
      listeners.push.apply(listeners, moveEvent.concat(endEvent, outEvent));
      // Text selection isn't an issue on touch devices,
      // so adding cursor styles can be skipped.
      if (event.cursor) {
        // Prevent the 'I' cursor and extend the range-drag cursor.
        scope_Body.style.cursor = getComputedStyle(event.target).cursor;
        // Mark the target with a dragging state.
        if (scope_Handles.length > 1) {
          addClass(scope_Target, options.cssClasses.drag);
        }
        // Prevent text selection when dragging the handles.
        // In noUiSlider <= 9.2.0, this was handled by calling preventDefault on mouse/touch start/move,
        // which is scroll blocking. The selectstart event is supported by FireFox starting from version 52,
        // meaning the only holdout is iOS Safari. This doesn't matter: text selection isn't triggered there.
        // The 'cursor' flag is false.
        // See: http://caniuse.com/#search=selectstart
        scope_Body.addEventListener("selectstart", preventDefault, false);
      }
      data.handleNumbers.forEach(function (handleNumber) {
        fireEvent("start", handleNumber);
      });
    }
    // Move closest handle to tapped location.
    function eventTap(event) {
      // The tap event shouldn't propagate up
      event.stopPropagation();
      var proposal = calcPointToPercentage(event.calcPoint);
      var handleNumber = getClosestHandle(proposal);
      // Tackle the case that all handles are 'disabled'.
      if (handleNumber === false) {
        return;
      }
      // Flag the slider as it is now in a transitional state.
      // Transition takes a configurable amount of ms (default 300). Re-enable the slider after that.
      if (!options.events.snap) {
        addClassFor(
          scope_Target,
          options.cssClasses.tap,
          options.animationDuration,
        );
      }
      setHandle(handleNumber, proposal, true, true);
      setZindex();
      fireEvent("slide", handleNumber, true);
      fireEvent("update", handleNumber, true);
      if (!options.events.snap) {
        fireEvent("change", handleNumber, true);
        fireEvent("set", handleNumber, true);
      } else {
        eventStart(event, { handleNumbers: [handleNumber] });
      }
    }
    // Fires a 'hover' event for a hovered mouse/pen position.
    function eventHover(event) {
      var proposal = calcPointToPercentage(event.calcPoint);
      var to = scope_Spectrum.getStep(proposal);
      var value = scope_Spectrum.fromStepping(to);
      Object.keys(scope_Events).forEach(function (targetEvent) {
        if ("hover" === targetEvent.split(".")[0]) {
          scope_Events[targetEvent].forEach(function (callback) {
            callback.call(scope_Self, value);
          });
        }
      });
    }
    // Handles keydown on focused handles
    // Don't move the document when pressing arrow keys on focused handles
    function eventKeydown(event, handleNumber) {
      if (isSliderDisabled() || isHandleDisabled(handleNumber)) {
        return false;
      }
      var horizontalKeys = ["Left", "Right"];
      var verticalKeys = ["Down", "Up"];
      var largeStepKeys = ["PageDown", "PageUp"];
      var edgeKeys = ["Home", "End"];
      if (options.dir && !options.ort) {
        // On an right-to-left slider, the left and right keys act inverted
        horizontalKeys.reverse();
      } else if (options.ort && !options.dir) {
        // On a top-to-bottom slider, the up and down keys act inverted
        verticalKeys.reverse();
        largeStepKeys.reverse();
      }
      // Strip "Arrow" for IE compatibility. https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
      var key = event.key.replace("Arrow", "");
      var isLargeDown = key === largeStepKeys[0];
      var isLargeUp = key === largeStepKeys[1];
      var isDown =
        key === verticalKeys[0] || key === horizontalKeys[0] || isLargeDown;
      var isUp =
        key === verticalKeys[1] || key === horizontalKeys[1] || isLargeUp;
      var isMin = key === edgeKeys[0];
      var isMax = key === edgeKeys[1];
      if (!isDown && !isUp && !isMin && !isMax) {
        return true;
      }
      event.preventDefault();
      var to;
      if (isUp || isDown) {
        var direction = isDown ? 0 : 1;
        var steps = getNextStepsForHandle(handleNumber);
        var step = steps[direction];
        // At the edge of a slider, do nothing
        if (step === null) {
          return false;
        }
        // No step set, use the default of 10% of the sub-range
        if (step === false) {
          step = scope_Spectrum.getDefaultStep(
            scope_Locations[handleNumber],
            isDown,
            options.keyboardDefaultStep,
          );
        }
        if (isLargeUp || isLargeDown) {
          step *= options.keyboardPageMultiplier;
        } else {
          step *= options.keyboardMultiplier;
        }
        // Step over zero-length ranges (#948);
        step = Math.max(step, 0.0000001);
        // Decrement for down steps
        step = (isDown ? -1 : 1) * step;
        to = scope_Values[handleNumber] + step;
      } else if (isMax) {
        // End key
        to = options.spectrum.xVal[options.spectrum.xVal.length - 1];
      } else {
        // Home key
        to = options.spectrum.xVal[0];
      }
      setHandle(handleNumber, scope_Spectrum.toStepping(to), true, true);
      fireEvent("slide", handleNumber);
      fireEvent("update", handleNumber);
      fireEvent("change", handleNumber);
      fireEvent("set", handleNumber);
      return false;
    }
    // Attach events to several slider parts.
    function bindSliderEvents(behaviour) {
      // Attach the standard drag event to the handles.
      if (!behaviour.fixed) {
        scope_Handles.forEach(function (handle, index) {
          // These events are only bound to the visual handle
          // element, not the 'real' origin element.
          attachEvent(actions.start, handle.children[0], eventStart, {
            handleNumbers: [index],
          });
        });
      }
      // Attach the tap event to the slider base.
      if (behaviour.tap) {
        attachEvent(actions.start, scope_Base, eventTap, {});
      }
      // Fire hover events
      if (behaviour.hover) {
        attachEvent(actions.move, scope_Base, eventHover, {
          hover: true,
        });
      }
      // Make the range draggable.
      if (behaviour.drag) {
        scope_Connects.forEach(function (connect, index) {
          if (
            connect === false ||
            index === 0 ||
            index === scope_Connects.length - 1
          ) {
            return;
          }
          var handleBefore = scope_Handles[index - 1];
          var handleAfter = scope_Handles[index];
          var eventHolders = [connect];
          var handlesToDrag = [handleBefore, handleAfter];
          var handleNumbersToDrag = [index - 1, index];
          addClass(connect, options.cssClasses.draggable);
          // When the range is fixed, the entire range can
          // be dragged by the handles. The handle in the first
          // origin will propagate the start event upward,
          // but it needs to be bound manually on the other.
          if (behaviour.fixed) {
            eventHolders.push(handleBefore.children[0]);
            eventHolders.push(handleAfter.children[0]);
          }
          if (behaviour.dragAll) {
            handlesToDrag = scope_Handles;
            handleNumbersToDrag = scope_HandleNumbers;
          }
          eventHolders.forEach(function (eventHolder) {
            attachEvent(actions.start, eventHolder, eventStart, {
              handles: handlesToDrag,
              handleNumbers: handleNumbersToDrag,
              connect: connect,
            });
          });
        });
      }
    }
    // Attach an event to this slider, possibly including a namespace
    function bindEvent(namespacedEvent, callback) {
      scope_Events[namespacedEvent] = scope_Events[namespacedEvent] || [];
      scope_Events[namespacedEvent].push(callback);
      // If the event bound is 'update,' fire it immediately for all handles.
      if (namespacedEvent.split(".")[0] === "update") {
        scope_Handles.forEach(function (a, index) {
          fireEvent("update", index);
        });
      }
    }
    function isInternalNamespace(namespace) {
      return (
        namespace === INTERNAL_EVENT_NS.aria ||
        namespace === INTERNAL_EVENT_NS.tooltips
      );
    }
    // Undo attachment of event
    function removeEvent(namespacedEvent) {
      var event = namespacedEvent && namespacedEvent.split(".")[0];
      var namespace = event
        ? namespacedEvent.substring(event.length)
        : namespacedEvent;
      Object.keys(scope_Events).forEach(function (bind) {
        var tEvent = bind.split(".")[0];
        var tNamespace = bind.substring(tEvent.length);
        if (
          (!event || event === tEvent) &&
          (!namespace || namespace === tNamespace)
        ) {
          // only delete protected internal event if intentional
          if (!isInternalNamespace(tNamespace) || namespace === tNamespace) {
            delete scope_Events[bind];
          }
        }
      });
    }
    // External event handling
    function fireEvent(eventName, handleNumber, tap) {
      Object.keys(scope_Events).forEach(function (targetEvent) {
        var eventType = targetEvent.split(".")[0];
        if (eventName === eventType) {
          scope_Events[targetEvent].forEach(function (callback) {
            callback.call(
              // Use the slider public API as the scope ('this')
              scope_Self,
              // Return values as array, so arg_1[arg_2] is always valid.
              scope_Values.map(options.format.to),
              // Handle index, 0 or 1
              handleNumber,
              // Un-formatted slider values
              scope_Values.slice(),
              // Event is fired by tap, true or false
              tap || false,
              // Left offset of the handle, in relation to the slider
              scope_Locations.slice(),
              // add the slider public API to an accessible parameter when this is unavailable
              scope_Self,
            );
          });
        }
      });
    }
    // Split out the handle positioning logic so the Move event can use it, too
    function checkHandlePosition(
      reference,
      handleNumber,
      to,
      lookBackward,
      lookForward,
      getValue,
      smoothSteps,
    ) {
      var distance;
      // For sliders with multiple handles, limit movement to the other handle.
      // Apply the margin option by adding it to the handle positions.
      if (scope_Handles.length > 1 && !options.events.unconstrained) {
        if (lookBackward && handleNumber > 0) {
          distance = scope_Spectrum.getAbsoluteDistance(
            reference[handleNumber - 1],
            options.margin,
            false,
          );
          to = Math.max(to, distance);
        }
        if (lookForward && handleNumber < scope_Handles.length - 1) {
          distance = scope_Spectrum.getAbsoluteDistance(
            reference[handleNumber + 1],
            options.margin,
            true,
          );
          to = Math.min(to, distance);
        }
      }
      // The limit option has the opposite effect, limiting handles to a
      // maximum distance from another. Limit must be > 0, as otherwise
      // handles would be unmovable.
      if (scope_Handles.length > 1 && options.limit) {
        if (lookBackward && handleNumber > 0) {
          distance = scope_Spectrum.getAbsoluteDistance(
            reference[handleNumber - 1],
            options.limit,
            false,
          );
          to = Math.min(to, distance);
        }
        if (lookForward && handleNumber < scope_Handles.length - 1) {
          distance = scope_Spectrum.getAbsoluteDistance(
            reference[handleNumber + 1],
            options.limit,
            true,
          );
          to = Math.max(to, distance);
        }
      }
      // The padding option keeps the handles a certain distance from the
      // edges of the slider. Padding must be > 0.
      if (options.padding) {
        if (handleNumber === 0) {
          distance = scope_Spectrum.getAbsoluteDistance(
            0,
            options.padding[0],
            false,
          );
          to = Math.max(to, distance);
        }
        if (handleNumber === scope_Handles.length - 1) {
          distance = scope_Spectrum.getAbsoluteDistance(
            100,
            options.padding[1],
            true,
          );
          to = Math.min(to, distance);
        }
      }
      if (!smoothSteps) {
        to = scope_Spectrum.getStep(to);
      }
      // Limit percentage to the 0 - 100 range
      to = limit(to);
      // Return false if handle can't move
      if (to === reference[handleNumber] && !getValue) {
        return false;
      }
      return to;
    }
    // Uses slider orientation to create CSS rules. a = base value;
    function inRuleOrder(v, a) {
      var o = options.ort;
      return (o ? a : v) + ", " + (o ? v : a);
    }
    // Moves handle(s) by a percentage
    // (bool, % to move, [% where handle started, ...], [index in scope_Handles, ...])
    function moveHandles(upward, proposal, locations, handleNumbers, connect) {
      var proposals = locations.slice();
      // Store first handle now, so we still have it in case handleNumbers is reversed
      var firstHandle = handleNumbers[0];
      var smoothSteps = options.events.smoothSteps;
      var b = [!upward, upward];
      var f = [upward, !upward];
      // Copy handleNumbers so we don't change the dataset
      handleNumbers = handleNumbers.slice();
      // Check to see which handle is 'leading'.
      // If that one can't move the second can't either.
      if (upward) {
        handleNumbers.reverse();
      }
      // Step 1: get the maximum percentage that any of the handles can move
      if (handleNumbers.length > 1) {
        handleNumbers.forEach(function (handleNumber, o) {
          var to = checkHandlePosition(
            proposals,
            handleNumber,
            proposals[handleNumber] + proposal,
            b[o],
            f[o],
            false,
            smoothSteps,
          );
          // Stop if one of the handles can't move.
          if (to === false) {
            proposal = 0;
          } else {
            proposal = to - proposals[handleNumber];
            proposals[handleNumber] = to;
          }
        });
      }
      // If using one handle, check backward AND forward
      else {
        b = f = [true];
      }
      var state = false;
      // Step 2: Try to set the handles with the found percentage
      handleNumbers.forEach(function (handleNumber, o) {
        state =
          setHandle(
            handleNumber,
            locations[handleNumber] + proposal,
            b[o],
            f[o],
            false,
            smoothSteps,
          ) || state;
      });
      // Step 3: If a handle moved, fire events
      if (state) {
        handleNumbers.forEach(function (handleNumber) {
          fireEvent("update", handleNumber);
          fireEvent("slide", handleNumber);
        });
        // If target is a connect, then fire drag event
        if (connect != undefined) {
          fireEvent("drag", firstHandle);
        }
      }
    }
    // Takes a base value and an offset. This offset is used for the connect bar size.
    // In the initial design for this feature, the origin element was 1% wide.
    // Unfortunately, a rounding bug in Chrome makes it impossible to implement this feature
    // in this manner: https://bugs.chromium.org/p/chromium/issues/detail?id=798223
    function transformDirection(a, b) {
      return options.dir ? 100 - a - b : a;
    }
    // Updates scope_Locations and scope_Values, updates visual state
    function updateHandlePosition(handleNumber, to) {
      // Update locations.
      scope_Locations[handleNumber] = to;
      // Convert the value to the slider stepping/range.
      scope_Values[handleNumber] = scope_Spectrum.fromStepping(to);
      var translation = transformDirection(to, 0) - scope_DirOffset;
      var translateRule =
        "translate(" + inRuleOrder(translation + "%", "0") + ")";
      scope_Handles[handleNumber].style[options.transformRule] = translateRule;
      updateConnect(handleNumber);
      updateConnect(handleNumber + 1);
    }
    // Handles before the slider middle are stacked later = higher,
    // Handles after the middle later is lower
    // [[7] [8] .......... | .......... [5] [4]
    function setZindex() {
      scope_HandleNumbers.forEach(function (handleNumber) {
        var dir = scope_Locations[handleNumber] > 50 ? -1 : 1;
        var zIndex = 3 + (scope_Handles.length + dir * handleNumber);
        scope_Handles[handleNumber].style.zIndex = String(zIndex);
      });
    }
    // Test suggested values and apply margin, step.
    // if exactInput is true, don't run checkHandlePosition, then the handle can be placed in between steps (#436)
    function setHandle(
      handleNumber,
      to,
      lookBackward,
      lookForward,
      exactInput,
      smoothSteps,
    ) {
      if (!exactInput) {
        to = checkHandlePosition(
          scope_Locations,
          handleNumber,
          to,
          lookBackward,
          lookForward,
          false,
          smoothSteps,
        );
      }
      if (to === false) {
        return false;
      }
      updateHandlePosition(handleNumber, to);
      return true;
    }
    // Updates style attribute for connect nodes
    function updateConnect(index) {
      // Skip connects set to false
      if (!scope_Connects[index]) {
        return;
      }
      var l = 0;
      var h = 100;
      if (index !== 0) {
        l = scope_Locations[index - 1];
      }
      if (index !== scope_Connects.length - 1) {
        h = scope_Locations[index];
      }
      // We use two rules:
      // 'translate' to change the left/top offset;
      // 'scale' to change the width of the element;
      // As the element has a width of 100%, a translation of 100% is equal to 100% of the parent (.noUi-base)
      var connectWidth = h - l;
      var translateRule =
        "translate(" +
        inRuleOrder(transformDirection(l, connectWidth) + "%", "0") +
        ")";
      var scaleRule = "scale(" + inRuleOrder(connectWidth / 100, "1") + ")";
      scope_Connects[index].style[options.transformRule] =
        translateRule + " " + scaleRule;
    }
    // Parses value passed to .set method. Returns current value if not parse-able.
    function resolveToValue(to, handleNumber) {
      // Setting with null indicates an 'ignore'.
      // Inputting 'false' is invalid.
      if (to === null || to === false || to === undefined) {
        return scope_Locations[handleNumber];
      }
      // If a formatted number was passed, attempt to decode it.
      if (typeof to === "number") {
        to = String(to);
      }
      to = options.format.from(to);
      if (to !== false) {
        to = scope_Spectrum.toStepping(to);
      }
      // If parsing the number failed, use the current value.
      if (to === false || isNaN(to)) {
        return scope_Locations[handleNumber];
      }
      return to;
    }
    // Set the slider value.
    function valueSet(input, fireSetEvent, exactInput) {
      var values = asArray(input);
      var isInit = scope_Locations[0] === undefined;
      // Event fires by default
      fireSetEvent = fireSetEvent === undefined ? true : fireSetEvent;
      // Animation is optional.
      // Make sure the initial values were set before using animated placement.
      if (options.animate && !isInit) {
        addClassFor(
          scope_Target,
          options.cssClasses.tap,
          options.animationDuration,
        );
      }
      // First pass, without lookAhead but with lookBackward. Values are set from left to right.
      scope_HandleNumbers.forEach(function (handleNumber) {
        setHandle(
          handleNumber,
          resolveToValue(values[handleNumber], handleNumber),
          true,
          false,
          exactInput,
        );
      });
      var i = scope_HandleNumbers.length === 1 ? 0 : 1;
      // Spread handles evenly across the slider if the range has no size (min=max)
      if (isInit && scope_Spectrum.hasNoSize()) {
        exactInput = true;
        scope_Locations[0] = 0;
        if (scope_HandleNumbers.length > 1) {
          var space_1 = 100 / (scope_HandleNumbers.length - 1);
          scope_HandleNumbers.forEach(function (handleNumber) {
            scope_Locations[handleNumber] = handleNumber * space_1;
          });
        }
      }
      // Secondary passes. Now that all base values are set, apply constraints.
      // Iterate all handles to ensure constraints are applied for the entire slider (Issue #1009)
      for (; i < scope_HandleNumbers.length; ++i) {
        scope_HandleNumbers.forEach(function (handleNumber) {
          setHandle(
            handleNumber,
            scope_Locations[handleNumber],
            true,
            true,
            exactInput,
          );
        });
      }
      setZindex();
      scope_HandleNumbers.forEach(function (handleNumber) {
        fireEvent("update", handleNumber);
        // Fire the event only for handles that received a new value, as per #579
        if (values[handleNumber] !== null && fireSetEvent) {
          fireEvent("set", handleNumber);
        }
      });
    }
    // Reset slider to initial values
    function valueReset(fireSetEvent) {
      valueSet(options.start, fireSetEvent);
    }
    // Set value for a single handle
    function valueSetHandle(handleNumber, value, fireSetEvent, exactInput) {
      // Ensure numeric input
      handleNumber = Number(handleNumber);
      if (!(handleNumber >= 0 && handleNumber < scope_HandleNumbers.length)) {
        throw new Error(
          "noUiSlider: invalid handle number, got: " + handleNumber,
        );
      }
      // Look both backward and forward, since we don't want this handle to "push" other handles (#960);
      // The exactInput argument can be used to ignore slider stepping (#436)
      setHandle(
        handleNumber,
        resolveToValue(value, handleNumber),
        true,
        true,
        exactInput,
      );
      fireEvent("update", handleNumber);
      if (fireSetEvent) {
        fireEvent("set", handleNumber);
      }
    }
    // Get the slider value.
    function valueGet(unencoded) {
      if (unencoded === void 0) {
        unencoded = false;
      }
      if (unencoded) {
        // return a copy of the raw values
        return scope_Values.length === 1
          ? scope_Values[0]
          : scope_Values.slice(0);
      }
      var values = scope_Values.map(options.format.to);
      // If only one handle is used, return a single value.
      if (values.length === 1) {
        return values[0];
      }
      return values;
    }
    // Removes classes from the root and empties it.
    function destroy() {
      // remove protected internal listeners
      removeEvent(INTERNAL_EVENT_NS.aria);
      removeEvent(INTERNAL_EVENT_NS.tooltips);
      Object.keys(options.cssClasses).forEach(function (key) {
        removeClass(scope_Target, options.cssClasses[key]);
      });
      while (scope_Target.firstChild) {
        scope_Target.removeChild(scope_Target.firstChild);
      }
      delete scope_Target.noUiSlider;
    }
    function getNextStepsForHandle(handleNumber) {
      var location = scope_Locations[handleNumber];
      var nearbySteps = scope_Spectrum.getNearbySteps(location);
      var value = scope_Values[handleNumber];
      var increment = nearbySteps.thisStep.step;
      var decrement = null;
      // If snapped, directly use defined step value
      if (options.snap) {
        return [
          value - nearbySteps.stepBefore.startValue || null,
          nearbySteps.stepAfter.startValue - value || null,
        ];
      }
      // If the next value in this step moves into the next step,
      // the increment is the start of the next step - the current value
      if (increment !== false) {
        if (value + increment > nearbySteps.stepAfter.startValue) {
          increment = nearbySteps.stepAfter.startValue - value;
        }
      }
      // If the value is beyond the starting point
      if (value > nearbySteps.thisStep.startValue) {
        decrement = nearbySteps.thisStep.step;
      } else if (nearbySteps.stepBefore.step === false) {
        decrement = false;
      }
      // If a handle is at the start of a step, it always steps back into the previous step first
      else {
        decrement = value - nearbySteps.stepBefore.highestStep;
      }
      // Now, if at the slider edges, there is no in/decrement
      if (location === 100) {
        increment = null;
      } else if (location === 0) {
        decrement = null;
      }
      // As per #391, the comparison for the decrement step can have some rounding issues.
      var stepDecimals = scope_Spectrum.countStepDecimals();
      // Round per #391
      if (increment !== null && increment !== false) {
        increment = Number(increment.toFixed(stepDecimals));
      }
      if (decrement !== null && decrement !== false) {
        decrement = Number(decrement.toFixed(stepDecimals));
      }
      return [decrement, increment];
    }
    // Get the current step size for the slider.
    function getNextSteps() {
      return scope_HandleNumbers.map(getNextStepsForHandle);
    }
    // Updatable: margin, limit, padding, step, range, animate, snap
    function updateOptions(optionsToUpdate, fireSetEvent) {
      // Spectrum is created using the range, snap, direction and step options.
      // 'snap' and 'step' can be updated.
      // If 'snap' and 'step' are not passed, they should remain unchanged.
      var v = valueGet();
      var updateAble = [
        "margin",
        "limit",
        "padding",
        "range",
        "animate",
        "snap",
        "step",
        "format",
        "pips",
        "tooltips",
      ];
      // Only change options that we're actually passed to update.
      updateAble.forEach(function (name) {
        // Check for undefined. null removes the value.
        if (optionsToUpdate[name] !== undefined) {
          originalOptions[name] = optionsToUpdate[name];
        }
      });
      var newOptions = testOptions(originalOptions);
      // Load new options into the slider state
      updateAble.forEach(function (name) {
        if (optionsToUpdate[name] !== undefined) {
          options[name] = newOptions[name];
        }
      });
      scope_Spectrum = newOptions.spectrum;
      // Limit, margin and padding depend on the spectrum but are stored outside of it. (#677)
      options.margin = newOptions.margin;
      options.limit = newOptions.limit;
      options.padding = newOptions.padding;
      // Update pips, removes existing.
      if (options.pips) {
        pips(options.pips);
      } else {
        removePips();
      }
      // Update tooltips, removes existing.
      if (options.tooltips) {
        tooltips();
      } else {
        removeTooltips();
      }
      // Invalidate the current positioning so valueSet forces an update.
      scope_Locations = [];
      valueSet(
        isSet(optionsToUpdate.start) ? optionsToUpdate.start : v,
        fireSetEvent,
      );
    }
    // Initialization steps
    function setupSlider() {
      // Create the base element, initialize HTML and set classes.
      // Add handles and connect elements.
      scope_Base = addSlider(scope_Target);
      addElements(options.connect, scope_Base);
      // Attach user events.
      bindSliderEvents(options.events);
      // Use the public value method to set the start values.
      valueSet(options.start);
      if (options.pips) {
        pips(options.pips);
      }
      if (options.tooltips) {
        tooltips();
      }
      aria();
    }
    setupSlider();
    var scope_Self = {
      destroy: destroy,
      steps: getNextSteps,
      on: bindEvent,
      off: removeEvent,
      get: valueGet,
      set: valueSet,
      setHandle: valueSetHandle,
      reset: valueReset,
      disable: disable,
      enable: enable,
      // Exposed for unit testing, don't use this in your application.
      __moveHandles: function (upward, proposal, handleNumbers) {
        moveHandles(upward, proposal, scope_Locations, handleNumbers);
      },
      options: originalOptions,
      updateOptions: updateOptions,
      target: scope_Target,
      removePips: removePips,
      removeTooltips: removeTooltips,
      getPositions: function () {
        return scope_Locations.slice();
      },
      getTooltips: function () {
        return scope_Tooltips;
      },
      getOrigins: function () {
        return scope_Handles;
      },
      pips: pips, // Issue #594
    };
    return scope_Self;
  }
  // Run the standard initializer
  function initialize(target, originalOptions) {
    if (!target || !target.nodeName) {
      throw new Error(
        "noUiSlider: create requires a single element, got: " + target,
      );
    }
    // Throw an error if the slider was already initialized.
    if (target.noUiSlider) {
      throw new Error("noUiSlider: Slider was already initialized.");
    }
    // Test the options and create the slider environment;
    var options = testOptions(originalOptions);
    var api = scope(target, options, originalOptions);
    target.noUiSlider = api;
    return api;
  }

  /* harmony default export */ const nouislider = {
    // Exposed for unit testing, don't use this in your application.
    __spectrum: Spectrum,
    // A reference to the default classes, allows global changes.
    // Use the cssClasses option for changes to one slider.
    cssClasses: cssClasses,
    create: initialize,
  }; // CONCATENATED MODULE: ./src/js/files/script.js

  // Подключение из node_modules

  function bildSliders() {
    //BildSlider
    let sliders = document.querySelectorAll(
      '[class*="__swiper"]:not(.swiper-wrapper)',
    );
    if (sliders) {
      sliders.forEach((slider) => {
        slider.parentElement.classList.add("swiper");
        slider.classList.add("swiper-wrapper");
        for (const slide of slider.children) {
          slide.classList.add("swiper-slide");
        }
      });
    }
  }

  function initSliders() {
    bildSliders();
    // слайдер 'Виды скважин на воду'
    if (document.querySelector("#types-wells__slider")) {
      new Swiper("#types-wells__slider", {
        observer: true,
        watchSlidesProgress: true,
        observeParents: true,
        slidesPerView: 2,
        spaceBetween: 20,
        speed: 300,
        autoHeight: false,

        breakpoints: {
          319.98: {
            slidesPerView: 1.3,
            spaceBetween: 15,
          },
          429.98: {
            slidesPerView: 1.3,
            spaceBetween: 10,
          },

          767.98: {
            autoplay: false,
            slidesPerView: 1.6,
          },
          1023.98: {
            slidesPerView: 3,
            spaceBetween: 20,
            autoplay: false,
          },
        },
        on: {},
      });
    }
    // слайдер 'Выполненные работы'
    if (document.querySelector(".completed-work__slider")) {
      new Swiper(".completed-work__slider", {
        observer: true,
        observeParents: true,
        slidesPerView: 2,
        spaceBetween: 30,
        speed: 300,

        navigation: {
          nextEl: ".completed-work__nav .completed-work__next",
          prevEl: ".completed-work__nav .completed-work__prev",
        },
        breakpoints: {
          320: {
            slidesPerView: 1.2,
            spaceBetween: 15,
          },
          430: {
            slidesPerView: 1.3,
            spaceBetween: 15,
          },
          768: { slidesPerView: 1, spaceBetween: 30 },
          1023.98: {
            slidesPerView: 1,
          },
          1279.98: {
            slidesPerView: 2,
          },
        },
        on: {},
      });
    }
    // слайдер 'Бренды септиков'
    if (document.querySelector(".brand-carusel__slider")) {
      new Swiper(".brand-carusel__slider", {
        observer: true,
        watchSlidesProgress: true,
        observeParents: true,
        slidesPerView: 3,
        spaceBetween: 30,
        speed: 300,
        autoHeight: false,
        navigation: {
          nextEl: ".brand-carusel__nav .brand-carusel__next",
          prevEl: ".brand-carusel__nav .brand-carusel__prev",
        },
        breakpoints: {
          319.98: {
            slidesPerView: 1.3,
            spaceBetween: 15,
          },

          767.98: {
            autoplay: false,
            slidesPerView: 2.6,
          },
          1023.98: {
            slidesPerView: 3,
            spaceBetween: 20,
            autoplay: false,
          },
          1279.98: {
            slidesPerView: 3,
            spaceBetween: 20,
            autoplay: false,
          },
        },
        on: {},
      });
    }
    // слайдер 'Популярные модели септиков'
    if (document.querySelector(".popular-models__slider")) {
      let pop = new Swiper(".popular-models__slider", {
        watchSlidesProgress: true,
        slidesPerView: 4,
        spaceBetween: 0,
        speed: 300,

        loop: true,
        navigation: {
          nextEl: ".popular-models__nav .popular-models__next",
          prevEl: ".popular-models__nav .popular-models__prev",
        },
        breakpoints: {
          320: {
            slidesPerView: 1.2,
            centeredSlides: false,
          },
          374.98: {
            slidesPerView: 1.4,
            centeredSlides: true,
          },

          768: {
            centeredSlides: false,
            slidesPerView: 2.5,
          },
          1024: { slidesPerView: 3 },
          1280: {
            slidesPerView: 4,
            initialSlide: 0,
          },
        },
        on: {},
      });
      setTimeout(() => {
        pop.loopDestroy();
        pop.loopCreate();
      }, 1);
    }

    // слайдер телеграм
    if (document.querySelector(".submitted__slider-post")) {
      new Swiper(".submitted__slider-post", {
        observer: true,
        observeParents: true,
        slidesPerView: 3,
        spaceBetween: 30,
        autoHeight: false,
        speed: 300,

        navigation: {
          nextEl: ".submitted__nav .submitted__next",
          prevEl: ".submitted__nav .submitted__prev",
        },
        breakpoints: {
          320: {
            slidesPerView: 1.2,
            spaceBetween: 15,
          },
          430: { slidesPerView: 1.4, spaceBetween: 15 },
          768: {
            slidesPerView: "2.5",
          },
          1023.98: {
            spaceBetween: 30,
            slidesPerView: "3",
          },
        },

        on: {},
      });
    }
    // слайдер youtube
    if (document.querySelector("#slider-video")) {
      new Swiper("#slider-video", {
        observer: true,
        observeParents: true,
        slidesPerView: "2",
        spaceBetween: 30,
        autoHeight: false,
        speed: 300,

        // Arrows
        navigation: {
          nextEl: ".submitted__youtube-nav .submitted__youtube-next",
          prevEl: ".submitted__youtube-nav .submitted__youtube-prev",
        },
        breakpoints: {
          320: {
            slidesPerView: 1.5,
            spaceBetween: 15,
          },
          430: {
            centeredSlides: false,
            slidesPerView: 1.6,
            spaceBetween: 15,
          },
          768: { centeredSlides: false, spaceBetween: 20 },
          1024: {
            slidesPerView: 2,
            spaceBetween: 30,
          },
        },

        on: {},
      });
    }

    // слайдер журнал
    if (document.querySelector("#magazine-slide")) {
      new Swiper("#magazine-slide", {
        observer: true,
        observeParents: true,
        slidesPerView: 3,
        speed: 300,
        navigation: {
          nextEl: ".submitted__magazine-nav .submitted__magazine-next",
          prevEl: ".submitted__magazine-nav .submitted__magazine-prev",
        },
        breakpoints: {
          320: {
            slidesPerView: 1.3,
            spaceBetween: 15,
          },
          430: {
            centeredSlides: false,
            slidesPerView: 1.6,
            spaceBetween: 20,
          },
          768: { slidesPerView: 2.5, spaceBetween: 20 },
          1024: {
            slidesPerView: 3,
            spaceBetween: 30,
          },
        },

        on: {},
      });
    }
    // слайдер 'Варианты анализа воды'
    if (document.querySelector(".water-analysis__slider")) {
      new Swiper(".water-analysis__slider", {
        observer: true,
        observeParents: true,
        slidesPerView: 3,
        spaceBetween: 30,
        autoHeight: false,
        speed: 300,

        breakpoints: {
          319.98: {
            slidesPerView: 1.2,
            spaceBetween: 20,
          },

          767.98: {
            slidesPerView: 1.2,
            spaceBetween: 30,
          },
          1023.98: { slidesPerView: 2 },
        },

        on: {},
      });
    }
    // слайдер 'Что мы можем?'
    if (document.querySelector("#we-doing")) {
      new Swiper("#we-doing", {
        observer: true,
        observeParents: true,
        slidesPerView: 4,
        spaceBetween: 25,
        autoHeight: false,
        speed: 300,
        loop: true,
        autoplay: {
          delay: 3000,
        },
        // Arrows
        navigation: {
          nextEl: ".we-doing__nav .we-doing__next",
          prevEl: ".we-doing__nav .we-doing__prev",
        },

        breakpoints: {
          319.98: {
            slidesPerView: 1.1,
            spaceBetween: 15,
            loop: true,
            autoplay: {
              delay: 3000,
            },
            centeredSlides: true,
          },
          429.98: { slidesPerView: 1.1 },

          767.98: {
            slidesPerView: 2.3,
            spaceBetween: 15,
          },
          1023.98: { slidesPerView: 3, spaceBetween: 20 },
          1439.98: {
            spaceBetween: 24,
          },
        },

        on: {},
      });
    }
    // слайдер 'Примеры работ'
    if (document.querySelector("#work-examples")) {
      new Swiper("#work-examples", {
        observer: true,
        observeParents: true,
        slidesPerView: 4,
        spaceBetween: 25,
        autoHeight: false,
        speed: 300,
        loop: true,
        autoplay: {
          delay: 4000,
        },
        // Arrows
        navigation: {
          nextEl: ".work-examples__nav .work-examples__next",
          prevEl: ".work-examples__nav .work-examples__prev",
        },

        breakpoints: {
          319.98: {
            slidesPerView: 1.1,
            spaceBetween: 15,
            loop: true,
            autoplay: {
              delay: 3000,
            },
            centeredSlides: true,
          },
          429.98: { slidesPerView: 1.2 },
          529.98: { slidesPerView: 1.8 },

          767.98: {
            slidesPerView: 2.3,
            spaceBetween: 15,
          },
          1023.98: { slidesPerView: 3, spaceBetween: 20 },
          1439.98: {
            spaceBetween: 24,
          },
        },

        on: {},
      });
    }
    // слайдер 'Варианты ухода за газоном'
    if (document.querySelector(".lawn-options__slider")) {
      new Swiper(".lawn-options__slider", {
        observer: true,
        observeParents: true,
        slidesPerView: 3,
        spaceBetween: 30,
        autoHeight: false,
        speed: 300,
        pagination: {
          el: ".so-discount__pagging",
          clickable: true,
        },

        breakpoints: {
          319.98: {
            slidesPerView: 1.1,
            spaceBetween: 30,
          },
          429.98: { slidesPerView: 1.28 },

          767.98: {
            slidesPerView: 2.25,
            spaceBetween: 30,
          },
          1023.98: { slidesPerView: 3 },
        },

        on: {},
      });
    }
    // слайдер 'Как выгоднее с нами работать?'
    if (document.querySelector(".so-discount__slider")) {
      new Swiper(".so-discount__slider", {
        observer: true,
        observeParents: true,
        slidesPerView: 3,
        spaceBetween: 30,
        autoHeight: false,
        speed: 300,
        pagination: {
          el: ".so-discount__pagging",
          clickable: true,
        },

        breakpoints: {
          319.98: {
            slidesPerView: 1.1,
            spaceBetween: 30,
          },
          429.98: { slidesPerView: 1.28 },

          767.98: {
            slidesPerView: 2.25,
            spaceBetween: 30,
          },
          1023.98: { slidesPerView: 3 },
        },

        on: {},
      });
    }
    // слайдер c sewera
    if (
      document.querySelector(".banner-gallery__slider:not(.swiper-initialized)")
    ) {
      new Swiper(".banner-gallery__slider:not(.swiper-initialized)", {
        observer: true,
        observeParents: true,
        slidesPerView: 1,
        spaceBetween: 0,
        autoHeight: false,
        speed: 300,
        autoplay: {
          delay: 3000,
        },
        loop: true,
        navigation: {
          prevEl: ".banner-gallery__navigation .banner-gallery__btn_prev",
          nextEl: ".banner-gallery__navigation .banner-gallery__btn_next",
        },
        pagination: {
          el: ".banner-gallery__pagination",
          clickable: true,
        },

        breakpoints: {},

        on: {},
      });
    }
  }
  window.addEventListener("load", function (e) {
    // Запуск инициализации слайдеров
    initSliders();
    initPopupSlider();
  });
  function initPopupSlider() {
    const pop = new Popup();

    const containerSlider = document.querySelector(".submitted__swiper-yt");

    if (!containerSlider) return;

    containerSlider.addEventListener("click", function (event) {
      if (!event.target.closest(".submitted__slide-yt_video")) return;

      let slideTargetVideo = event.target.closest(".submitted__slide-yt_video")
        .dataset.slide;

      bildSliders();

      if (document.querySelector(".popup-video__slider")) {
        const swiper = new Swiper(".popup-video__slider", {
          observer: true,
          observeParents: true,

          spaceBetween: 30,
          autoHeight: false,
          speed: 500,
          pagination: {
            el: "",
            clickable: true,
          },
          slideToClickedSlide: true,
          navigation: {
            nextEl: "#slider-popup-video_navigation #slider-popup-video_next",
            prevEl: "#slider-popup-video_navigation #slider-popup-video_prev",
          },
          breakpoints: {
            320: {
              spaceBetween: 15,
              centeredSlides: true,
              slidesPerView: "1.3",
            },
            430: {
              centeredSlides: true,
              spaceBetween: 15,
              slidesPerView: "1.2",
              initialSlide: 0,
            },
            768: {
              spaceBetween: 25,
              centeredSlides: false,
              slidesPerView: "1",
            },
            992: {
              slidesPerView: "1",
              spaceBetween: 30,
            },
          },

          on: {},
        });
        swiper.on("update", function () {
          swiper.slideTo(slideTargetVideo, 1, false);
        });
        swiper.on("slideChange", function () {
          pop.options.on.beforeClose();
        });
        swiper.update();
      }
    });

    function findVideos() {
      let videos = document.querySelectorAll("._video-yt");
      for (let i = 0; i < videos.length; i++) {
        setupVideo(videos[i]);
      }
    }
    findVideos();
    function setupVideo(video) {
      let link = video.querySelector("._video-yt-link");
      let media = video.querySelector("._video-yt-media");
      let button = video.querySelector("._video-yt-btn");
      let id = parseMediaURL(media);

      video.addEventListener("click", () => {
        let iframe = createIframe(id);

        link.style.display = "none";
        button.style.display = "none";
        video.appendChild(iframe);
      });

      link.removeAttribute("href");
      video.classList.add("video--enabled");
    }

    function parseMediaURL(media) {
      let regexp =
        /https:\/\/i\.ytimg\.com\/vi\/([a-zA-Z0-9_-]+)\/maxresdefault\.jpg/i;
      let url = media.src;
      let match = url.match(regexp);

      return match[1];
    }

    function createIframe(id) {
      let iframe = document.createElement("iframe");

      iframe.setAttribute("allowfullscreen", "");
      // iframe.setAttribute('allow', 'autoplay');
      iframe.setAttribute("id", "youtube-slide");

      iframe.setAttribute("src", generateURL(id));
      iframe.classList.add("popup-video__media");
      return iframe;
    }
    function generateURL(id) {
      let query = "?enablejsapi=1&rel=0&showinfo=0&autoplay=1";

      return "https://www.youtube.com/embed/" + id + query;
    }
  }

  // function initPopupSlider() {
  //   const initPopups = new Popup();

  //   const containerSlider = document.querySelector('.submitted__swiper-yt');

  //   if (containerSlider) {
  //     containerSlider.addEventListener('click', function (event) {
  //       if (!event.target.closest('.submitted__slide-yt_video')) return;

  //       let slideTargetVideo = event.target.closest('.submitted__slide-yt_video')
  //         .dataset.slide;

  //       bildSliders();

  //       if (document.querySelector('.popup-video__slider')) {
  //         const swiper = new Swiper(
  //           '.popup-video__slider:not(.swiper-initialized)',
  //           {
  //             observer: true,
  //             observeParents: true,

  //             spaceBetween: 30,
  //             autoHeight: false,
  //             speed: 500,
  //             pagination: {
  //               el: '',
  //               clickable: true,
  //             },
  //             slideToClickedSlide: true,
  //             navigation: {
  //               nextEl: '#slider-popup-video_navigation #slider-popup-video_next',
  //               prevEl: '#slider-popup-video_navigation #slider-popup-video_prev',
  //             },
  //             breakpoints: {
  //               320: {
  //                 spaceBetween: 15,
  //                 centeredSlides: true,
  //                 slidesPerView: '1.3',
  //               },
  //               430: {
  //                 centeredSlides: true,
  //                 spaceBetween: 15,
  //                 slidesPerView: '1.2',
  //                 initialSlide: 0,
  //               },
  //               768: {
  //                 spaceBetween: 25,
  //                 centeredSlides: false,
  //                 slidesPerView: '1',
  //               },
  //               992: {
  //                 slidesPerView: '1',
  //                 spaceBetween: 30,
  //               },
  //             },

  //             on: {},
  //           }
  //         );
  //         swiper.on('update', function () {
  //           swiper.slideTo(slideTargetVideo, 1, false);
  //         });
  //         swiper.on('slideChange', function () {
  //           initPopups.options.on.beforeClose();
  //         });
  //
  //         swiper.update();
  //       }
  //     });
  //   }

  //   function findVideos() {
  //     let videos = document.querySelectorAll('._video-yt');
  //     for (let i = 0; i < videos.length; i++) {
  //       setupVideo(videos[i]);
  //     }
  //   }
  //   findVideos();
  //   function setupVideo(video) {
  //     let link = video.querySelector('._video-yt-link');
  //     let button = video.querySelector('._video-yt-btn');
  //     let id = parseIdFromUrl(link.href);

  //     video.addEventListener('click', () => {
  //       let iframe = createIframe(id);

  //       link.style.display = 'none';
  //       button.style.display = 'none';
  //       video.appendChild(iframe);
  //     });

  //     link.removeAttribute('href');
  //     video.classList.add('video--enabled');
  //   }

  //   function parseIdFromUrl(url) {
  //     const regexp = /https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)\?*/i;
  //     const match = url.match(regexp);

  //     return match ? match[1] : false;
  //   }

  //   function createIframe(id) {
  //     let iframe = document.createElement('iframe');

  //     iframe.setAttribute('allowfullscreen', '');
  //     iframe.setAttribute('allow', 'autoplay');
  //     iframe.setAttribute('id', 'youtube-slide');

  //     iframe.setAttribute('src', generateURL(id));
  //     iframe.classList.add('popup-video__media');
  //     return iframe;
  //   }
  //   function generateURL(id) {
  //     let query = '?enablejsapi=1&rel=0&showinfo=0&autoplay=1';

  //     return 'https://www.youtube.com/embed/' + id + query;
  //   }
  // }
  /* инициализация карты */
  // function initMap() {
  //   const cityList = [
  //     {
  //       city: 'москва',
  //       center: [55.73, 37.6],
  //       zoom: 8,
  //       polygon: [
  //         [54.80831947994278, 38.18433433925412],
  //         [54.87945876925923, 38.52995859405644],
  //         [55.122011885673516, 38.67767483903884],
  //         [55.37773639221365, 38.95005546337981],
  //         [55.69101620830514, 39.06854923170738],
  //         [55.962220037403114, 39.09331426601756],
  //         [56.118493229997256, 38.83962697728742],
  //         [56.38328535103986, 38.538312268742686],
  //         [56.72694946754399, 38.84094055277811],
  //         [56.54218234666476, 37.45911829335503],
  //         [56.484269925944716, 36.55340126947627],
  //         [56.082994973012944, 35.26044765213379],
  //         [55.528582146509564, 35.79574540554199],
  //         [54.886906159423376, 36.2751232506904],
  //         [54.80831947994278, 38.18433433925412],
  //       ],
  //     },
  //     {
  //       city: 'питер',
  //       center: [59.93, 30.31],
  //       zoom: 7,
  //       polygon: [
  //         [61.106088074302846, 28.84990729821095],
  //         [60.54048161644306, 27.852634950925818],
  //         [60.75790210590904, 28.70283621526761],
  //         [60.71577485205364, 28.815934690349366],
  //         [60.36998777034415, 28.591678325406576],
  //         [60.16918067335956, 29.40829044088855],
  //         [60.211534546111665, 29.565211415079403],
  //         [60.187888023113686, 29.76919931592809],
  //         [60.15288724263536, 29.946358034169208],
  //         [60.12523238261545, 30.01739461918757],
  //         [60.0423242615806, 29.96706282242633],
  //         [59.98493140629839, 30.238787111520338],
  //         [59.93232002134522, 30.232711129552428],
  //         [59.84017052918489, 30.131823462708525],
  //         [59.885551817464716, 29.780468838045408],
  //         [59.93961408752628, 29.49723475289224],
  //         [59.964616467662836, 29.19559571694552],
  //         [59.91991225984697, 29.093497700881187],
  //         [59.83296746003299, 29.087954398797308],
  //         [59.78396907811887, 28.914027896498567],
  //         [59.75631501176312, 28.72500164979357],
  //         [59.800093425856545, 28.60943866524633],
  //         [59.80224973132346, 28.510190763084665],
  //         [59.73798583871411, 28.485433522283643],
  //         [59.66933873971914, 28.443601343301964],
  //         [59.6455402380044, 28.376395134689574],
  //         [59.65854803135656, 28.293968754917074],
  //         [59.69130561691546, 28.200415788977097],
  //         [59.74283516453832, 28.176907105205913],
  //         [59.767886802293845, 28.119769460495604],
  //         [59.671623961424615, 28.052389391540657],
  //         [59.53828823226743, 28.139961089731088],
  //         [59.35798953936603, 28.280648261698502],
  //         [59.02248117220134, 27.802166784452368],
  //         [59.00045046566632, 28.16716353323224],
  //         [58.90325564969078, 28.305782371843577],
  //         [58.892541977172385, 28.547145432234146],
  //         [58.839964234623864, 28.845593925558575],
  //         [58.81921766186278, 29.117229752723944],
  //         [58.71702324975635, 29.25362211337176],
  //         [58.61141214319082, 29.417761707109804],
  //         [58.52810610714258, 29.61583387713702],
  //         [58.45004102025334, 29.77698972302713],
  //         [58.47175326366724, 30.057070714286084],
  //         [58.528177693429086, 30.078493270758997],
  //         [58.670382603306024, 30.045047415771506],
  //         [58.784750929872246, 30.172568775367296],
  //         [58.77110172497413, 30.343612119793363],
  //         [58.74393741340788, 30.50480117892272],
  //         [58.76087846060315, 30.64903410782111],
  //         [58.89266306882436, 30.720318055999343],
  //         [58.931775319679105, 30.87541133018749],
  //         [59.08920426528445, 31.001107474298152],
  //         [59.05199909544481, 31.247310598952225],
  //         [59.16120182948734, 31.46040108683397],
  //         [59.24601344328124, 31.51924861119312],
  //         [59.3841107762172, 31.519650608045566],
  //         [59.37453535197764, 31.743859355535903],
  //         [59.41319939652709, 31.895892426683588],
  //         [59.4229337327242, 32.06818148171814],
  //         [59.35859553485514, 32.20693837199164],
  //         [59.28307118884456, 32.32414465705074],
  //         [59.17916450331086, 32.39505501883892],
  //         [59.15220746691128, 32.516090367786234],
  //         [59.16411241403188, 32.67707713805814],
  //         [59.25209559211132, 32.704493920109],
  //         [59.34898953782607, 32.772563410771056],
  //         [59.396925101876036, 32.86750784159898],
  //         [59.44235324548666, 33.07951705642466],
  //         [59.413053844884786, 33.23037247596619],
  //         [59.42351502348515, 33.46150882912565],
  //         [59.3621493877059, 33.71617224039184],
  //         [59.28076198027452, 33.85555732820072],
  //         [59.18093545333778, 34.07927365350611],
  //         [59.218446738264504, 34.31479262566086],
  //         [59.18449031867098, 34.46167119790215],
  //         [59.15756557610953, 34.569028458632886],
  //         [59.134213013591875, 34.74295902207777],
  //         [59.19477306563164, 34.801078803116695],
  //         [59.2564359565597, 34.97977799727809],
  //         [59.2912162694453, 35.12579135405289],
  //         [59.32989570283232, 35.26304437874467],
  //         [59.394126305198824, 35.282047170349756],
  //         [59.44494765499957, 35.336190323574385],
  //         [59.527887428452004, 35.279241905261756],
  //         [59.55491865313289, 35.38593012930545],
  //         [59.56172289354441, 35.45519752319393],
  //         [59.63727521994343, 35.448287025471046],
  //         [59.65468260646398, 35.555353868864756],
  //         [59.686264326387004, 35.562483180192146],
  //         [59.703950761999664, 35.42163323598487],
  //         [59.76838546078838, 35.34683149778368],
  //         [59.85256037133368, 35.3567480923831],
  //         [59.92369691755857, 35.406137191942264],
  //         [59.9805250889039, 35.28730686193509],
  //         [60.017895388841026, 35.10473292452272],
  //         [60.08351447005737, 35.16532530607367],
  //         [60.18264270143564, 35.12041199589066],
  //         [60.25167418889458, 35.135359361852636],
  //         [60.33731700421731, 35.225018017333184],
  //         [60.599637668599655, 35.24198481129656],
  //         [60.66614517771396, 35.19836887519892],
  //         [60.73404500750823, 35.14189036348486],
  //         [60.860688754947546, 35.23361484311272],
  //         [60.88857627351911, 35.38923417605841],
  //         [60.93444654114589, 35.52607157330945],
  //         [61.02021458655281, 35.63697856871454],
  //         [61.1083074214377, 35.66627786728151],
  //         [61.15697755043698, 35.65753483388153],
  //         [61.138111449137995, 35.513698102849844],
  //         [61.12318207774868, 35.36526337298682],
  //         [61.1832439172974, 35.335165607609014],
  //         [61.23909327326484, 35.34306604636703],
  //         [61.228582198408304, 35.19403076257794],
  //         [61.22860626645772, 35.028774374516416],
  //         [61.26035502030351, 34.80014854115669],
  //         [61.228371912248804, 34.62740677860907],
  //         [61.16914050333483],
  //         34.521057796999315,
  //         [61.1381625782991, 34.375724845099],
  //         [61.193136211572295, 34.274744102545526],
  //         [61.207127022717884, 34.01546202975132],
  //         [61.203757474773255, 33.698387119373336],
  //         [61.16566629145257, 33.56353423301232],
  //         [61.15193178960703, 33.495864964454626],
  //         [61.10094639830956, 33.57979779688657],
  //         [61.14509680547397, 33.76467751366431],
  //         [61.12465903378748, 33.91802782223414],
  //         [61.008016691462956, 33.941252627795365],
  //         [60.9144170484949, 33.816468775562356],
  //         [60.92079313266953, 33.67582168857538],
  //         [60.95277608109717, 33.57544502404991],
  //         [60.99486230036612, 33.50047914244152],
  //         [60.9656518934932, 33.47746318511602],
  //         [60.920762010627215, 33.49682021768072],
  //         [60.88595190808354, 33.39188123480494],
  //         [60.8360574570367, 33.341192219070024],
  //         [60.753586881331614, 33.26077873445362],
  //         [60.696863877704004, 33.128608162644554],
  //         [60.66744942292257, 33.013157521200924],
  //         [60.47643160894205, 32.82599005653793],
  //         [60.50472927233986, 32.65483755366424],
  //         [60.396308853622884, 32.74780061241211],
  //         [60.31819019883031, 32.66598898975374],
  //         [60.245199187531796, 32.65909996699057],
  //         [60.161066458141306, 32.61444214580604],
  //         [60.12614806592467, 32.495855101856904],
  //         [60.09471699316654, 32.301778825749864],
  //         [60.11039252448461, 32.18459263609901],
  //         [60.16749132430087, 32.070916239492675],
  //         [60.18998264893045, 31.889161919783447],
  //         [60.18675966797986, 31.73410743459536],
  //         [60.119836209160354, 31.65017367415598],
  //         [60.0605217394008, 31.6046419601648],
  //         [59.99324259600215, 31.610785530865854],
  //         [59.93335651991168, 31.59401443688691],
  //         [59.880472446391366, 31.50763516198711],
  //         [59.886351135496454, 31.27940617403553],
  //         [59.90097354234132, 31.142684758149613],
  //         [59.91566408008279, 30.99993686742772],
  //         [59.95660389144942, 30.951398418986003],
  //         [60.00105689222647, 31.02619414415352],
  //         [60.07363677987078, 31.053152954550058],
  //         [60.151108957508114, 30.981435482398467],
  //         [60.22734836046297, 30.91402784967906],
  //         [60.375430876166945, 30.82185987239356],
  //         [60.49908511402646, 30.692137455248258],
  //         [60.58062586990846, 30.57597504845583],
  //         [60.64945709096361, 30.443091178705856],
  //         [60.73859746306803, 30.47682683528842],
  //         [60.806970681028275, 30.462987825587703],
  //         [61.00722789319536, 30.257720710362037],
  //         [61.0946869940374, 30.081598200023848],
  //         [61.151348903426424, 29.830549834254754],
  //         [61.15529478015222, 29.613444318104058],
  //         [61.212959857671194, 29.516226783570488],
  //         [61.263060270690886, 29.348334364957054],
  //         [61.25454458553398, 29.24086735976627],
  //         [61.106088074302846, 28.84990729821095],
  //       ],
  //     },
  //   ];
  //   const tabsMap = document.querySelectorAll('.ya-map__tab');

  //   var myMap = new ymaps.Map(
  //     'map',
  //     {
  //       center: cityList[0].center,
  //       zoom: 8,
  //     },
  //     {
  //       searchControlProvider: 'yandex#search',
  //     }
  //   );

  //   if (tabsMap.length !== 0) {
  //     tabsMap.forEach((element) => {
  //       const dataCity = element.dataset.cityMap;
  //       let objCity = cityList.find((el) => dataCity === el.city);

  //       let myPolygon = new ymaps.Polygon(
  //         [objCity.polygon],
  //         {
  //           hintContent: 'Многоугольник',
  //         },
  //         {
  //           fillColor: '#009CD9',
  //           strokeWidth: 1,
  //           strokeColor: '#0067A0',
  //           strokeOpacity: 1,
  //           fillOpacity: 0.2,
  //         }
  //       );
  //       myMap.geoObjects.add(myPolygon);
  //       myMap.geoObjects.add(new ymaps.Placemark(objCity.center, {}));

  //       element.addEventListener('click', (e) => {
  //         myMap.setCenter(objCity.center, objCity.zoom);
  //         if (element.closest('._active-tab-map')) {
  //           return;
  //         }
  //         tabsMap.forEach((el) => el.classList.remove('_active-tab-map'));
  //         element.classList.add('_active-tab-map');
  //       });
  //     });
  //   } else {
  //     myMap.geoObjects.add(new ymaps.Placemark([55.73, 37.6], {}));
  //     let myPolygon = new ymaps.Polygon(
  //       [
  //         [
  //           [54.80831947994278, 38.18433433925412],
  //           [54.87945876925923, 38.52995859405644],
  //           [55.122011885673516, 38.67767483903884],
  //           [55.37773639221365, 38.95005546337981],
  //           [55.69101620830514, 39.06854923170738],
  //           [55.962220037403114, 39.09331426601756],
  //           [56.118493229997256, 38.83962697728742],
  //           [56.38328535103986, 38.538312268742686],
  //           [56.72694946754399, 38.84094055277811],
  //           [56.54218234666476, 37.45911829335503],
  //           [56.484269925944716, 36.55340126947627],
  //           [56.082994973012944, 35.26044765213379],
  //           [55.528582146509564, 35.79574540554199],
  //           [54.886906159423376, 36.2751232506904],
  //           [54.80831947994278, 38.18433433925412],
  //         ],
  //       ],
  //       {
  //         hintContent: 'Многоугольник',
  //       },
  //       {
  //         fillColor: '#009CD9',
  //         strokeWidth: 1,
  //         strokeColor: '#0067A0',
  //         strokeOpacity: 1,
  //         fillOpacity: 0.2,
  //       }
  //     );

  //     myMap.geoObjects.add(myPolygon);
  //   }

  //   // myMap.controls.remove('zoomControl'); // удаляем контрол зуммирования
  //   myMap.controls.remove('geolocationControl'); // удаляем геолокацию
  //   myMap.controls.remove('searchControl'); // удаляем поиск
  //   myMap.controls.remove('trafficControl'); // удаляем контроль трафика
  //   myMap.controls.remove('typeSelector'); // удаляем тип
  //   myMap.controls.remove('fullscreenControl'); // удаляем кнопку перехода в полноэкранный режим
  //   myMap.controls.remove('rulerControl'); // удаляем контрол правил
  //   myMap.behaviors.disable(['scrollZoom']); // отключаем скролл карты (опционально)
  // }
  // ymaps.ready(initMap);
  /* кнопка инфо  Модификации */

  // ===================================================================
  function tabModificationModel() {
    const infoModelBtn = document.querySelectorAll(".card-model__info-btn");
    if (infoModelBtn) {
      infoModelBtn.forEach((element, indx) => {
        // полуялоны емодели
        element.addEventListener("click", function (e) {
          element.classList.toggle("_show");
        });
        document.addEventListener("click", (e) => {
          let target = e.target;

          if (element.contains(target)) return;
          if (!element.firstChild.contains(target)) {
            element.classList.remove("_show");
          }
        });
      });
    }
    const dataModel = [
      // 1
      {
        oneTopBtn: [
          {
            linkModel: "septik-akvalos-4",
            id: "1",
            img: "1",
            name: "Септик Аквалос 4",
            onePointList: "60",
            threePointList: "250",
            price: "106 200 ₽",
            discount: "118 000 ₽",
          },
        ],
        twoTopBtn: [
          {
            linkModel: "septik-akvalos-4-pr",

            id: "1",
            img: "1",
            name: "Септик Аквалос 4 ПР",
            onePointList: "60",
            threePointList: "230",
            price: "106 200 ₽",
            discount: "118 000 ₽",
          },
        ],
      },
      // 2
      {
        oneTopBtn: [
          {
            linkModel: "septik-tver-0-35p",

            id: "1",
            img: "2-s",
            name: "Септик Тверь 0,35 П",
            onePointList: "30",
            threePointList: "120",
            price: "108 900 ₽",
            discount: "",
          },
        ],
        twoTopBtn: [
          {
            linkModel: "septik-tver-0-35-pn",
            id: "1",
            img: "2-p",
            name: "Септик Тверь 0,35 ПН",
            onePointList: "30",
            threePointList: "110",
            price: "118 800 ₽",
            discount: "",
          },
        ],
      },
      // 3
      {
        oneTopBtn: [
          {
            linkModel: "septik-tver-0-5-p",
            id: "1",
            img: "3-s",
            name: "Септик Тверь 0,5 П",
            onePointList: "30",
            threePointList: "120",
            price: "118 800 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-0-5-pm",
            id: "2",
            img: "3-s-pm",
            name: "Септик Тверь 0,5 ПМ",
            onePointList: "60",
            threePointList: "110",
            price: "136 900 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-0-5-np",
            id: "3",
            img: "3-s",
            name: "Септик Тверь 0,5 НП",
            onePointList: "60",
            threePointList: "120",
            price: "131 800 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-0-5-npm",
            id: "4",
            img: "3-s-pm",
            name: "Септик Тверь 0,5 НПМ",
            onePointList: "60",
            threePointList: "120",
            price: "151 600 ₽",
            discount: "",
          },
        ],
        twoTopBtn: [
          {
            linkModel: "septik-tver-0-5-pn",
            id: "1",
            img: "3-p",
            name: "Септик Тверь 0,5 ПН",
            onePointList: "30",
            threePointList: "120",
            price: "118 800 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-0-5-pnm",
            id: "2",
            img: "3-p-pm",
            name: "Септик Тверь 0,5 ПНМ",
            onePointList: "60",
            threePointList: "120",
            price: "151 600 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-0-5-npn",
            id: "3",
            img: "3-p",
            name: "Септик Тверь 0,5 НПН",
            onePointList: "30",
            threePointList: "120",
            price: "142 700 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-0-5-npnm",
            id: "4",
            img: "3-p-mpn",
            name: "Септик Тверь 0,8 НПНМ",
            onePointList: "60",
            threePointList: "120",
            price: "164 900 ₽",
            discount: "",
          },
        ],
      },
      // 4
      {
        oneTopBtn: [
          {
            linkModel: "septik-astra-5",
            id: "1",
            img: "4",
            name: "Септик Юнилос Астра 5",
            onePointList: "85",
            threePointList: "250",
            price: "123 250 ₽",
            discount: "145 000 ₽",
          },
          {
            linkModel: "septik-astra-5-midi",
            id: "2",
            img: "4-m",
            name: "Септик Юнилос Астра 5 Миди",
            onePointList: "100",
            threePointList: "250",
            price: "125 800 ₽",
            discount: "148 000 ₽",
          },
          {
            linkModel: "septik-astra-5-long",
            id: "3",
            img: "4-l",
            name: "Септик Юнилос Астра 5 Лонг",
            onePointList: "150",
            threePointList: "250",
            price: "141 950 ₽",
            discount: "167 000 ₽",
          },
        ],
        twoTopBtn: [
          {
            linkModel: "septik-astra-5-pr",
            id: "1",
            img: "4",
            name: "Септик Юнилос Астра 5 Пр",
            onePointList: "85",
            threePointList: "250",
            price: "127 500 ₽",
            discount: "150 000 ₽",
          },
          {
            linkModel: "septik-astra-5-midi-pr",
            id: "2",
            img: "4-m",
            name: "Септик Юнилос Астра 5 Миди Пр",
            onePointList: "100",
            threePointList: "250",
            price: "130 050 ₽",
            discount: "153 000 ₽",
          },
          {
            linkModel: "septik-astra-5-long-pr",
            id: "3",
            img: "4-l",
            name: "Септик Юнилос Астра 5 Лонг Пр",
            onePointList: "150",
            threePointList: "250",
            price: "146 200 ₽",
            discount: "172 000",
          },
        ],
      },
      // 5
      {
        oneTopBtn: [
          {
            linkModel: "septik-topol-6",
            id: "1",
            img: "5",
            name: "Септик Тополь 6",
            onePointList: "85",
            threePointList: "270",
            price: "129 420 ₽",
            discount: "143 800 ₽",
          },
          {
            linkModel: "septik-topol-6-pljus",
            id: "2",
            img: "5-p",
            name: "Септик Тополь 6 Плюс",
            onePointList: " 135",
            threePointList: "270",
            price: "145 440 ₽",
            discount: "161 600 ₽",
          },
        ],
        twoTopBtn: [
          {
            linkModel: "septik-topol-6-pr",
            id: "1",
            img: "5-p",
            name: "Септик Тополь 6 Пр",
            onePointList: "85",
            threePointList: "270",
            price: "139 500 ₽",
            discount: "155 000 ₽",
          },
          {
            linkModel: "septik-topol-6-pr-pljus",
            id: "2",
            img: "5-p",
            name: "Септик Тополь 6 Пр Плюс",
            onePointList: "135",
            threePointList: "270",
            price: "157 320 ₽",
            discount: "174 800 ₽",
          },
        ],
      },
      // 6
      {
        oneTopBtn: [
          {
            linkModel: "septik-tver-085-p",
            id: "1",
            img: "6-s",
            name: "Септик Тверь 0,8 П",
            onePointList: "30",
            threePointList: "120",
            price: "135 900 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-085-pm",
            id: "2",
            img: "6-s-pm",
            name: "Септик Тверь 0,8 ПМ",
            onePointList: "60",
            threePointList: "225",
            price: "159 600 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-085-np",
            id: "3",
            img: "6-s",
            name: "Септик Тверь 0,8 НП",
            onePointList: "102",
            threePointList: "225",
            price: "150 900 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-085-npm",
            id: "4",
            img: "6-s-pm",
            name: "Септик Тверь 0,8 НПМ",
            onePointList: "132",
            threePointList: "225",
            price: "178 400 ₽",
            discount: "",
          },
        ],
        twoTopBtn: [
          {
            linkModel: "septik-tver-085-pn",
            id: "1",
            img: "6-p",
            name: "Септик Тверь 0,8 ПН",
            onePointList: "30",
            threePointList: "630",
            price: "150 700 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-085-pnm",
            id: "2",
            img: "6-p-pm",
            name: "Септик Тверь 0,8 ПНМ",
            onePointList: "60",
            threePointList: "225",
            price: "178 400 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-085-npn",
            id: "3",
            img: "6-p",
            name: "Септик Тверь 0,8 НПН",
            onePointList: "102",
            threePointList: "225",
            price: "163 900 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-085-npnm",
            id: "4",
            img: "6-p-pm",
            name: "Септик Тверь 0,8 НП",
            onePointList: "132",
            threePointList: "225",
            price: "192 600 ₽",
            discount: "",
          },
        ],
      },
      // 7
      {
        oneTopBtn: [
          {
            linkModel: "septik-akvalos-8",
            id: "1",
            img: "7",
            name: "Септик Аквалос 8",
            onePointList: "60",
            threePointList: "700",
            price: "130 050 ₽",
            discount: "165 000 ₽",
          },
          {
            linkModel: "septik-akvalos-8-mid",
            id: "2",
            img: "7-m",
            name: "Септик Аквалос 8 Миди",
            onePointList: "85",
            threePointList: "700",
            price: "153 900 ₽",
            discount: "171 000 ₽",
          },
          {
            linkModel: "septik-akvalos-8-long",
            id: "3",
            img: "7-l",
            name: "Септик Аквалос 8 Лонг",
            onePointList: "120",
            threePointList: "700",
            price: "167 400 ₽",
            discount: "186 000 ₽",
          },
        ],
        twoTopBtn: [
          {
            linkModel: "septik-akvalos-8-pr",
            id: "1",
            img: "7",
            name: "Септик Аквалос 8 Пр",
            onePointList: "60",
            threePointList: "630",
            price: "148 500 ₽",
            discount: "165 000 ₽",
          },
          {
            linkModel: "septik-akvalos-8-midi-pr",
            id: "2",
            img: "7-m",
            name: "Септик Аквалос 8 Миди Пр",
            onePointList: "85",
            threePointList: "630",
            price: "153 900 ₽",
            discount: "171 000 ₽",
          },
          {
            linkModel: "septik-akvalos-8-long-pr",
            id: "3",
            img: "7-l",
            name: "Септик Аквалос 8 Лонг Пр",
            onePointList: "120",
            threePointList: "700",
            price: "167 400 ₽",
            discount: "186 000",
          },
        ],
      },
      // 8
      {
        oneTopBtn: [
          {
            linkModel: "septik-astra-8",
            id: "1",
            img: "4",
            name: "Септик Юнилос Астра 8",
            onePointList: "85",
            threePointList: "350",
            price: "149 600 ₽",
            discount: "176 000 ₽",
          },
          {
            linkModel: "septik-astra-8-midi",
            id: "2",
            img: "4-m",
            name: "Септик Юнилос Астра 8 Миди",
            onePointList: "100",
            threePointList: "350",
            price: "152 150 ₽",
            discount: "179 000 ₽",
          },
          {
            linkModel: "septik-astra-8-long",
            id: "3",
            img: "4-l",
            name: "Септик Юнилос Астра 8 Лонг",
            onePointList: "150",
            threePointList: "350",
            price: "173 400 ₽",
            discount: "204 000 ₽",
          },
        ],
        twoTopBtn: [
          {
            linkModel: "septik-astra-8-pr",
            id: "1",
            img: "4",
            name: "Септик Юнилос Астра 8 Пр",
            onePointList: "85",
            threePointList: "350",
            price: "153 850 ₽",
            discount: "181 850 ₽",
          },
          {
            linkModel: "septik-astra-8-midi-pr",
            id: "2",
            img: "4-m",
            name: "Септик Юнилос Астра 8 Миди Пр",
            onePointList: "100",
            threePointList: "350",
            price: "156 400 ₽",
            discount: "184 000 ₽",
          },
          {
            linkModel: "septik-astra-8-long-pr",
            id: "3",
            img: "4-l",
            name: "Септик Юнилос Астра 8 Лонг Пр",
            onePointList: "150",
            threePointList: "350",
            price: "167 400 ₽",
            discount: "177 650 ₽",
          },
        ],
      },
      // 9
      {
        oneTopBtn: [
          {
            linkModel: "septik-tver-1-p",
            id: "1",
            img: "9-s",
            name: "Септик Тверь 1,1 П",
            onePointList: "30",
            threePointList: "330",
            price: "152 475 ₽",
            discount: "160 500 ₽",
          },
          {
            linkModel: "septik-tver-1-pm",
            id: "2",
            img: "9-s-pm",
            name: "Септик Тверь 1,1 ПМ",
            onePointList: " 60",
            threePointList: "330",
            price: "184 300 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-1-np",
            id: "3",
            img: "9-s",
            name: "Септик Тверь 1,1 НП",
            onePointList: "102",
            threePointList: "330",
            price: "174 900 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-1-npm",
            id: "4",
            img: "9-s-pm",
            name: "Септик Тверь 1,1 НПМ",
            onePointList: "132",
            threePointList: "225",
            price: "199 800 ₽",
            discount: "",
          },
        ],
        twoTopBtn: [
          {
            linkModel: "septik-tver-1-pn",
            id: "1",
            img: "9-p",
            name: "Септик Тверь 1,1 ПН",
            onePointList: "30",
            threePointList: "330",
            price: "174 900 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-1-pnm",
            id: "2",
            img: "9-p-pm",
            name: "Септик Тверь 1,1 ПНМ",
            onePointList: "60",
            threePointList: "330",
            price: "199 800 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-1-pnm",
            id: "3",
            img: "9-p",
            name: "Септик Тверь 1,1 НПН",
            onePointList: "102",
            threePointList: "330",
            price: "189 400 ₽",
            discount: "",
          },
          {
            linkModel: "septik-tver-1-npnm",
            id: "4",
            img: "9-p-pm",
            name: "Септик Тверь 1,1 НП",
            onePointList: "132",
            threePointList: "330",
            price: "251 900 ₽",
            discount: "",
          },
        ],
      },
    ];
    const slidesModel = document.querySelector(".popular-models__swiper");
    if (slidesModel) {
      slidesModel.addEventListener("click", function (e) {
        let target = e.target;
        selectTab(target, ".card-model__top-btn");
        selectTab(target, ".card-model__bottom-btn");

        let activeBottomBtn = "1";
        let activeTopBtn = "1";
        const slideModel = document.querySelectorAll(".popular-models__slide");
        let findIndxSlide;
        let indxSlide;

        if (target.closest("[data-top-id]")) {
          for (let z = 0; z < slideModel.length; z++) {
            const element = slideModel[z];
            if (
              element.dataset.slideId ===
              target.closest("[data-top-id]").dataset.topId
            ) {
              findIndxSlide = slideModel[+element.dataset.swiperSlideIndex + 4];
              indxSlide = element.dataset.swiperSlideIndex;
              activeTopBtn = searchActiveBtn(
                findIndxSlide.querySelector(".card-model__top-btns"),
              );
              if (findIndxSlide.querySelector(".card-model__bottom-btns")) {
                activeBottomBtn = searchActiveBtn(
                  findIndxSlide.querySelector(".card-model__bottom-btns"),
                );
              }
            }
          }
        }

        if (target.closest("[data-bottom-id]")) {
          for (let i = 0; i < slideModel.length; i++) {
            const element = slideModel[i];
            if (
              element.dataset.slideId ===
              target.closest("[data-bottom-id]").dataset.bottomId
            ) {
              findIndxSlide = slideModel[+element.dataset.swiperSlideIndex + 4];
              indxSlide = element.dataset.slideId;
              activeTopBtn = searchActiveBtn(
                findIndxSlide.querySelector(".card-model__top-btns"),
              );
              activeBottomBtn = searchActiveBtn(target.parentElement);
              break;
            }
          }
        }
        if (!findIndxSlide) return;
        const topBtn = findIndxSlide.querySelector(".card-model__top-btns");
        const nameModel = findIndxSlide.querySelector(".card-model__name");
        const priceModel = findIndxSlide.querySelector(
          ".card-model__current-price",
        );
        const discountModel = findIndxSlide.querySelector(
          ".card-model__discount-price",
        );
        const imgModel = findIndxSlide.querySelector(".card-model__img img");
        const listModel = findIndxSlide.querySelector(".card-model__list");
        const likeBtn = findIndxSlide.querySelector(".card-model__favorite");

        if (target.closest(".card-model__favorite")) {
          likeBtn.classList.toggle("_active");
        }
        activeTopBtn = searchActiveBtn(topBtn);

        let findObjModel = dataModel[indxSlide][activeTopBtn].find(
          (it) => it.id == activeBottomBtn,
        );

        if (findObjModel.name && nameModel) {
          nameModel.innerHTML = "";
          nameModel.innerHTML = findObjModel.name;
          nameModel.setAttribute(
            "href",
            `https://sewera.ru/products/${findObjModel.linkModel}`,
          );
        }

        if (findObjModel.price && priceModel) {
          priceModel.innerHTML = "";
          priceModel.innerHTML = findObjModel.price;
        }

        if (findObjModel.discount && discountModel) {
          discountModel.innerHTML = "";
          discountModel.innerHTML = findObjModel.discount;
        } else {
          if (discountModel) discountModel.innerHTML = "";
        }

        if (findObjModel.onePointList && listModel) {
          listModel.children[0].firstElementChild.innerHTML = "";
          listModel.children[0].firstElementChild.innerHTML =
            findObjModel.onePointList;
        }

        if (findObjModel.threePointList && listModel) {
          listModel.children[2].firstElementChild.innerHTML = "";
          listModel.children[2].firstElementChild.innerHTML =
            findObjModel.threePointList;
        }

        if (findObjModel.img && imgModel) {
          createImgSrc(imgModel, findObjModel.img);
        }

        listModel.children[3].firstElementChild.innerHTML = "";
        listModel.children[3].firstElementChild.innerHTML =
          activeTopBtn === "oneTopBtn" ? "Самотеком" : "Принудительный";
      });
    }
    /* добавдляем класс _active-btn */
    function selectTab(target, selectorBtn) {
      if (target.closest(selectorBtn) && !target.closest("._active-btn")) {
        Array.from(target.parentElement.children).forEach((el, i) => {
          el.classList.remove("_active-btn");
        });
        target.classList.add("_active-btn");
      }
    }
    // созадние пути для картнки
    function createImgSrc(img, btn) {
      if (btn) {
        const endIndxSrc = img.src.lastIndexOf("/");
        img.src = img.src.slice(0, endIndxSrc + 1) + btn + ".webp";
      }
    }

    /* поиск активного  класса в topBtn */
    function searchActiveBtn(selectorBtn) {
      let activeTopBtn;

      Array.from(selectorBtn.children).forEach((el) => {
        if (el.closest("._active-btn")) {
          let keys = Object.keys(el.dataset);
          activeTopBtn = el.dataset[keys[0]];
        }
      });

      return activeTopBtn;
    }
  }
  tabModificationModel();
  function rangeInit() {
    const arbitraryValuesForSlider = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "10+",
    ];

    var format = {
      to: function (value) {
        return arbitraryValuesForSlider[Math.round(value)];
      },
      from: function (value) {
        return arbitraryValuesForSlider.indexOf(value);
      },
    };
    const priceSlider = document.querySelector("#range");
    if (priceSlider) {
      let textFrom = priceSlider.getAttribute("data-from");
      let textTo = priceSlider.getAttribute("data-to");

      initialize(priceSlider, {
        start: 3,
        step: 1,
        range: {
          min: [0],
          max: [arbitraryValuesForSlider.length - 1],
        },
        tooltips: true,
        format: format,
        connect: [true, false],
        pips: {
          mode: "count",
          stepped: true,
          values: 11,

          format: format,
        },
      });
    }
  }
  rangeInit();

  function initQwiz() {
    const qwizFrom = document.querySelector("#services_quiz_form");
    const qwizCalc = document.querySelector("#calc-septik");
    if (qwizFrom) {
      const checkBlock = document.querySelector(".form-qwiz");
      const inputChecks = document.querySelectorAll(".form-qwiz__input");
      const steps = document.querySelectorAll(".form-qwiz__step");
      const prevBtn = document.querySelector(".qwiz-section__prev-btn");
      const nextBtn = document.querySelector(".qwiz-section__next-btn");
      const panelNavigate = document.querySelector(".qwiz-section__bottom");
      const stepCurrentNumber = document.querySelector(
        ".qwiz-section__current-step",
      );
      const restartBtn = document.querySelector(".form-qwiz__restart-btn");
      const finishStep = document.querySelector(".qwiz-section__finish-step");
      let currentStep = 0;
      let isCheck = false;

      nextBtn.addEventListener("click", nextStep);
      prevBtn.addEventListener("click", prevStep);
      checkBlock.addEventListener("click", isClickCheck);
      if (finishStep) finishStep.innerHTML = `/${steps.length - 1}`;
      // кнопка заказать занова
      if (restartBtn)
        restartBtn.addEventListener("click", function (e) {
          currentStep = 0;
          isCheck = false;
          stepCurrentNumber.innerHTML = 1;
          prevBtn.classList.add("_disabled");
          prevBtn.disabled = true;
          steps[0].classList.add("_current");
          steps[steps.length - 1].classList.remove("_current");
          panelNavigate.style.display = "flex";
          stepCurrentNumber.parentNode.style.display = "flex";
          stepCurrentNumber.parentNode.classList.remove("_ready");
          inputChecks.forEach((inpt) => (inpt.checked = false));
        });

      function isClickCheck(e) {
        let target = e.target;
        if (target.classList.contains("form-qwiz__input")) {
          isValidateFormService();

          if (!isCheck && currentStep === steps.length - 3) {
            nextBtn.classList.add("_disabled");
            nextBtn.disabled = true;
          }
          if (isCheck) {
            nextBtn.classList.remove("_disabled");
            nextBtn.disabled = false;
          }
        }
      }
      // ==============================================================================

      // шаг вперед
      function nextStep(e) {
        ++currentStep;

        isValidateFormService();

        console.log(currentStep);
        if (isCheck && currentStep === steps.length - 2) {
          stepCurrentNumber.parentNode.classList.add("_ready");
        }

        if (!isCheck && currentStep === steps.length - 3) {
          nextBtn.classList.add("_disabled");
          nextBtn.disabled = true;
        }
        if (steps.length - 1 === currentStep) {
          stepCurrentNumber.parentNode.style.display = "none";
        }

        if (steps.length - 2 === currentStep) {
          panelNavigate.style.display = "none";
        }

        if (steps.length === currentStep) {
          steps[currentStep - 1].style.display = "none";
          return;
        }

        stepCurrentNumber.innerHTML = currentStep + 1;

        prevBtn.classList.remove("_disabled");
        prevBtn.disabled = false;
        steps[currentStep - 1].classList.remove("_current");
        steps[currentStep].classList.add("_current");
      }
      // шаг назад
      function prevStep(e) {
        if (currentStep === steps.length - 2) {
          stepCurrentNumber.parentNode.classList.remove("_ready");
        }

        if (currentStep === steps.length - 3) {
          nextBtn.classList.remove("_disabled");
        }

        if (prevBtn.classList.contains("_disabled")) {
          return;
        }
        currentStep--;
        stepCurrentNumber.innerHTML = currentStep + 1;

        if (currentStep === 0) {
          prevBtn.classList.add("_disabled");
          prevBtn.disabled = true;
        }
        nextBtn.disabled = false;
        steps[currentStep + 1].classList.remove("_current");
        steps[currentStep].classList.add("_current");
      }

      // валидация чекбокса
      function isValidateFormService() {
        for (let i = 0; i < inputChecks.length; i++) {
          const element = inputChecks[i];
          if (element.checked) {
            isCheck = true;
            return;
          }
        }
        isCheck = false;
        return;
      }
      qwizFrom.addEventListener("submit", function (e) {
        e.preventDefault();
        var th = $("#services_quiz_form");
        $(".load__preloader").fadeIn("", function () {
          $.ajax({
            type: "POST",
            url: "/index.php?route=common/footer/quiz_submit",
            data: th.serialize(),
            dataType: "json",
          }).done(function (json) {
            if (json["success"]) {
              $(".load__preloader").fadeOut("slow");
              nextStep();
            }
          });
        });
        return false;
      });
    }
    if (qwizCalc) {
      const inputChecks = document.querySelectorAll(".form-qwiz__input");
      const steps = document.querySelectorAll(".form-qwiz__step");
      const prevBtn = document.querySelector(".qwiz-section__prev-btn");
      const nextBtn = document.querySelector(".qwiz-section__next-btn");
      const bottomPanel = document.querySelector(".qwiz-section__bottom");
      const navigatePanel = document.querySelector(".qwiz-section__navigate ");
      const stepCurrentNumber = document.querySelector(
        ".qwiz-section__current-step",
      );
      const radioBtn = document.querySelectorAll(
        'input[name="Место отвода воды из септика"]',
      );
      const oneRadioBtns = document.querySelectorAll(
        'input[name="Глубина залегания трубы"]',
      );
      const twoRadioBtns = document.querySelectorAll(
        'input[name="Место отвода воды из септика"]',
      );
      const threeRadioBtns = document.querySelectorAll(
        'input[name="Количество колец"]',
      );
      const restartBtn = document.querySelector(".form-qwiz__restart-btn");
      let currentStep = 0;
      let isCheck = true;
      let statusQuestion = false;

      radioBtn.forEach((radio) => {
        radio.addEventListener("change", () => {
          if (radio.value === "Дренажный колодец") {
            statusQuestion = true;
            return;
          }
          statusQuestion = false;
        });
      });

      nextBtn.addEventListener("click", nextStep);
      prevBtn.addEventListener("click", prevStep);

      if (document.querySelector(".qwiz-section__finish-step")) {
        document.querySelector(".qwiz-section__finish-step").innerHTML = `/${
          steps.length - 1
        }`;
      }

      // кнопка заказать занова
      if (restartBtn) {
        restartBtn.addEventListener("click", function (e) {
          currentStep = 0;
          stepCurrentNumber.innerHTML = "Шаг 1";
          prevBtn.classList.add("_disabled");
          steps[0].classList.add("_current");
          steps[steps.length - 1].classList.remove("_current");
          navigatePanel.style.display = "flex";
          prevBtn.style.display = "none";
          document.querySelector(".qwiz-section__progress-step").style.display =
            "flex";
          navigatePanel.style.justifyContent = "flex-end";
          deleteCheck(oneRadioBtns);
          deleteCheck(twoRadioBtns);
          deleteCheck(threeRadioBtns);
        });
      }

      // ==============================================================================

      function deleteCheck(selector) {
        selector.forEach((el) => {
          el.checked = false;
        });
      }

      function checkRadioValue(selector) {
        let res = false;
        selector.forEach((el) => {
          if (el.checked) {
            res = true;
          }
        });
        return res;
      }

      function eventRadio(selector) {
        if (selector) {
          selector.forEach((it) => {
            it.addEventListener("click", () => clickRadioCheck(selector));
          });
        }
      }

      function clickRadioCheck(slector) {
        checkRadioValue(slector);
        nextBtn.classList.remove("_disabled");
      }
      eventRadio(oneRadioBtns);
      eventRadio(twoRadioBtns);
      eventRadio(threeRadioBtns);
      // шаг вперед
      function nextStep(e) {
        let isOneRadio = checkRadioValue(oneRadioBtns);
        let isTwoRadio = checkRadioValue(twoRadioBtns);
        let isThreeRadio = checkRadioValue(threeRadioBtns);
        console.log(currentStep);

        if (currentStep == 2 && !statusQuestion) {
          nextBtn.classList.remove("_disabled");
        }
        // ==== 3
        if (currentStep === 2 && !isThreeRadio && statusQuestion) {
          nextBtn.classList.add("_disabled");
        }
        if (currentStep === 3 && !isThreeRadio) {
          return;
        }
        // ==== 2
        if (currentStep === 1 && !isTwoRadio) {
          nextBtn.classList.add("_disabled");
        }
        if (currentStep === 2 && !isTwoRadio) {
          return;
        }
        // ==== 1
        if (currentStep === 0 && !isOneRadio) {
          nextBtn.classList.add("_disabled");
        }

        if (currentStep === 1 && !isOneRadio) {
          return;
        }
        ++currentStep;

        isValidateFormService();

        if (steps.length === currentStep + 1) {
          document.querySelector(".qwiz-section__progress-step").style.display =
            "none";
        }

        if (steps.length - 2 === currentStep) {
          navigatePanel.style.display = "none";
        }
        if (currentStep === 1) {
          prevBtn.style.display = "inline-block";
          navigatePanel.style.justifyContent = "space-between";
        }

        if (isCheck && currentStep === steps.length - 2) {
          stepCurrentNumber.parentNode.classList.add("_ready");
        }

        if (steps.length - 1 === currentStep) {
          navigatePanel.style.display = "none";
        }
        if (bottomPanel && steps.length - 2 === currentStep) {
          bottomPanel.style.display = "none";
        }

        if (
          steps[currentStep].closest("._additional-question") &&
          !statusQuestion
        ) {
          switchCurrentClassName(currentStep - 1, currentStep + 1, nextBtn);
          currentStep = 4;
          editCountStepText(`Шаг ${currentStep}`);
          return;
        }
        prevBtn.classList.remove("_disabled");
        prevBtn.disabled = false;
        //прибаляем шаги +1
        if (statusQuestion) {
          editCountStepText(`Шаг ${currentStep}`);
        } else {
          editCountStepText(`Шаг ${currentStep + 1}`);
        }

        // на последнем шагу добавляет текст 'Итоги'
        if (steps.length - 1 === currentStep + 1) {
          showReusltSeptik();
          editCountStepText("Итоги");
        }
        //есди есть доп.вопрос добавляем 'Дополнительный вопрос'
        if (
          steps[currentStep].closest("._additional-question") &&
          statusQuestion
        ) {
          editCountStepText("Дополнительный вопрос");

          switchCurrentClassName(currentStep - 1, currentStep, prevBtn);
          return;
        }
        switchCurrentClassName(currentStep - 1, currentStep, prevBtn);
      }

      // шаг назад
      function prevStep(e) {
        let isTwoRadio = checkRadioValue(twoRadioBtns);
        if (currentStep == 3 && isTwoRadio) {
          nextBtn.classList.remove("_disabled");
        }
        if (currentStep == 1) {
          nextBtn.classList.remove("_disabled");
        }

        currentStep--;

        // проверка, покать доп.вопрос
        if (
          steps[currentStep].closest("._additional-question") &&
          !statusQuestion
        ) {
          switchCurrentClassName(currentStep + 1, currentStep - 1, nextBtn);
          currentStep = 2;
          editCountStepText(`Шаг ${currentStep + 1}`);
          return;
        }

        //доп.вопрос проверка текст
        if (
          steps[currentStep].closest("._additional-question") &&
          statusQuestion
        ) {
          editCountStepText("Дополнительный вопрос");
        } else {
          editCountStepText(`Шаг ${currentStep + 1}`);
        }

        if (currentStep === 0) {
          prevBtn.style.display = "none";
          navigatePanel.style.justifyContent = "flex-end";
          prevBtn.classList.add("_disabled");
          prevBtn.disabled = true;
        }
        nextBtn.disabled = false;
        switchCurrentClassName(currentStep + 1, currentStep);
      }

      // валидация чекбокса
      function isValidateFormService() {
        for (let i = 0; i < inputChecks.length; i++) {
          const element = inputChecks[i];
          if (element.checked) {
            isCheck = true;
            return;
          }
        }
        isCheck = false;
        return;
      }
      // меняем текст шага
      function editCountStepText(text) {
        stepCurrentNumber.innerHTML = text;
      }
      // меняем класс  у текущего шага
      function switchCurrentClassName(stepRemove, stepAdd) {
        steps[stepRemove].classList.remove("_current");
        steps[stepAdd].classList.add("_current");
      }
      qwizCalc.addEventListener("submit", function (e) {
        e.preventDefault();
        var th = $("#calc-septik");
        $(".load__preloader").fadeIn("", function () {
          $.ajax({
            type: "POST",
            url: "/index.php?route=common/footer/quiz_submit",
            data: th.serialize(),
            dataType: "json",
          }).done(function (json) {
            if (json["success"]) {
              $(".load__preloader").fadeOut("slow");
              nextStep();
            }
          });
        });
        return false;
      });
    }
  }
  initQwiz();
  // кнопеи сантехники
  function countPlumbingItems(params) {
    const plusBtn = document.querySelectorAll(".form-qwiz__btns-plumbing");

    if (plusBtn) {
      plusBtn.forEach((element) => {
        element.addEventListener("click", function (e) {
          let target = e.target;

          if (target.closest("._plus-plumbing")) {
            if (element.children[1].innerHTML >= 5) return;
            element.children[1].innerHTML++;
          }
          if (target.closest("._minus-plumbing")) {
            if (element.children[1].innerHTML <= 0) return;
            element.children[1].innerHTML--;
          }
        });
      });
    }
  }
  countPlumbingItems();

  // расчет производительности на всю сантехнику дома (раковины, ванна, туалет и т.д)
  function getValueItemPlumbing() {
    const selectorsCount = document.querySelectorAll(
      ".form-qwiz__count-plumbing",
    );
    let resSum = 0;
    let currentSum = 0;
    selectorsCount.forEach((element) => {
      let dataValue = element.dataset.plumbingValue;
      currentSum = dataValue * element.innerHTML;
      resSum += currentSum;
    });

    return resSum;
  }

  // выводим данные в итоги
  function showReusltSeptik(res) {
    const listResSelector = document.querySelectorAll(
      ".form-qwiz__content-finish",
    );
    const result = collectDate();

    listResSelector[0].innerHTML = result.onePoint;
    listResSelector[1].innerHTML = result.threePoint;
    listResSelector[2].innerHTML = result.twoPoint;

    listResSelector[4].innerHTML = result.fourPoint;
    if (!result.extraPoint) {
      listResSelector[3].parentElement.remove();
    } else {
      listResSelector[3].innerHTML = result.extraPoint;
    }
    debugger;
  }

  function collectDate() {
    const onePoint = document.querySelector(".noUi-handle").ariaValueText;
    const twoPoint = document.querySelectorAll(
      'input[name="Глубина залегания трубы"]',
    );
    const threePoint = document.querySelectorAll(
      'input[name="Место отвода воды из септика"]',
    );

    const extraPoint = document.querySelectorAll(
      'input[name="Количество колец"]',
    );
    const res = {
      onePoint,
      twoPoint: "",
      threePoint: "",
      fourPoint: "",
      extraPoint: "",
    };
    if (twoPoint) {
      twoPoint.forEach((el) => {
        if (el.checked) {
          res.twoPoint = el.value;
        }
      });
    }
    if (threePoint) {
      threePoint.forEach((el) => {
        if (el.checked) {
          res.threePoint = el.value;
        }
      });
    }
    if (extraPoint) {
      extraPoint.forEach((el) => {
        if (el.checked) {
          res.extraPoint = el.value;
        }
      });
    }
    res.fourPoint = getValueItemPlumbing();

    return res;
  }

  // Класс построения Select
  class SelectConstructor {
    constructor(props, data = null) {
      let defaultConfig = {
        init: true,
        logging: true,
      };
      this.config = Object.assign(defaultConfig, props);
      // CSS классы модуля
      this.selectClasses = {
        classSelect: "select", // Главный блок
        classSelectBody: "select__body", // Тело селекта
        classSelectTitle: "select__title", // Заголовок
        classSelectValue: "select__value", // Значение в заголовке
        classSelectLabel: "select__label", // Лабел
        classSelectInput: "select__input", // Поле ввода
        classSelectText: "select__text", // Оболочка текстовых данных
        classSelectLink: "select__link", // Ссылка в элементе
        classSelectOptions: "select__options", // Выпадающий список
        classSelectOptionsScroll: "select__scroll", // Оболочка при скролле
        classSelectOption: "select__option", // Пункт
        classSelectContent: "select__content", // Оболочка контента в заголовке
        classSelectRow: "select__row", // Ряд
        classSelectData: "select__asset", // Дополнительные данные
        classSelectDisabled: "_select-disabled", // Запрешен
        classSelectTag: "_select-tag", // Класс тега
        classSelectOpen: "_select-open", // Список открыт
        classSelectActive: "_select-active", // Список выбран
        classSelectFocus: "_select-focus", // Список в фокусе
        classSelectMultiple: "_select-multiple", // Мультивыбор
        classSelectCheckBox: "_select-checkbox", // Стиль чекбокса
        classSelectOptionSelected: "_select-selected", // Выбранный пункт
      };
      this._this = this;
      // Запуск инициализации
      if (this.config.init) {
        // Получение всех select на странице
        const selectItems = data
          ? document.querySelectorAll(data)
          : document.querySelectorAll("select");
        if (selectItems.length) {
          this.selectsInit(selectItems);
        } else {
        }
      }
    }
    // Конструктор CSS класса
    getSelectClass(className) {
      return `.${className}`;
    }
    // Геттер элементов псевдоселекта
    getSelectElement(selectItem, className) {
      return {
        originalSelect: selectItem.querySelector("select"),
        selectElement: selectItem.querySelector(this.getSelectClass(className)),
      };
    }
    // Функция инициализации всех селектов
    selectsInit(selectItems) {
      selectItems.forEach((originalSelect, index) => {
        this.selectInit(originalSelect, index + 1);
      });
      // Обработчики событий...
      // ...при клике
      document.addEventListener(
        "click",
        function (e) {
          this.selectsActions(e);
        }.bind(this),
      );
      // ...при нажатии клавиши
      document.addEventListener(
        "keydown",
        function (e) {
          this.selectsActions(e);
        }.bind(this),
      );
      // ...при фокусе
      document.addEventListener(
        "focusin",
        function (e) {
          this.selectsActions(e);
        }.bind(this),
      );
      // ...при потере фокуса
      document.addEventListener(
        "focusout",
        function (e) {
          this.selectsActions(e);
        }.bind(this),
      );
      document.addEventListener(
        "input",
        function (e) {
          this.selectsActions(e);
        }.bind(this),
      );
    }
    // Функция инициализации конкретного селекта
    selectInit(originalSelect, index) {
      const _this = this;
      // Создаем оболочку
      let selectItem = document.createElement("div");
      selectItem.classList.add(this.selectClasses.classSelect);
      // Выводим оболочку перед оригинальным селектом
      originalSelect.parentNode.insertBefore(selectItem, originalSelect);
      // Помещаем оригинальный селект в оболочку
      selectItem.appendChild(originalSelect);
      // Скрываем оригинальный селект
      originalSelect.hidden = true;

      // Присваиваем уникальный ID
      index ? (originalSelect.dataset.id = index) : null;

      // Конструктор косновных элементов
      selectItem.insertAdjacentHTML(
        "beforeend",
        `<div class="${this.selectClasses.classSelectBody}"><div hidden class="${this.selectClasses.classSelectOptions}"></div></div>`,
      );
      // Запускаем конструктор псевдоселекта
      this.selectBuild(originalSelect);

      // Работа с плейсхолдером
      if (this.getSelectPlaceholder(originalSelect)) {
        // Запоминаем плейсхолдер
        originalSelect.dataset.placeholder =
          this.getSelectPlaceholder(originalSelect).value;
        // Если включен режим label
        if (this.getSelectPlaceholder(originalSelect).label.show) {
          const selectItemTitle = this.getSelectElement(
            selectItem,
            this.selectClasses.classSelectTitle,
          ).selectElement;
          selectItemTitle.insertAdjacentHTML(
            "afterbegin",
            `<span class="${this.selectClasses.classSelectLabel}">${
              this.getSelectPlaceholder(originalSelect).label.text
                ? this.getSelectPlaceholder(originalSelect).label.text
                : this.getSelectPlaceholder(originalSelect).value
            }</span>`,
          );
        }
      }
      // Запоминаем скорость
      originalSelect.dataset.speed = originalSelect.dataset.speed
        ? originalSelect.dataset.speed
        : "150";
      // Событие при изменении оригинального select

      originalSelect.addEventListener("change", function (e) {
        _this.selectChange(e);
      });
    }
    // Конструктор псевдоселекта
    selectBuild(originalSelect) {
      const selectItem = originalSelect.parentElement;
      // Добавляем ID селекта
      selectItem.dataset.id = originalSelect.dataset.id;
      // Получаем класс оригинального селекта, создаем модификатор и добавляем его
      selectItem.classList.add(
        originalSelect.getAttribute("class")
          ? `select_${originalSelect.getAttribute("class")}`
          : "",
      );
      // Если множественный выбор, добавляем класс
      originalSelect.multiple
        ? selectItem.classList.add(this.selectClasses.classSelectMultiple)
        : selectItem.classList.remove(this.selectClasses.classSelectMultiple);
      // Cтилизация элементов под checkbox (только для multiple)
      originalSelect.hasAttribute("data-checkbox") && originalSelect.multiple
        ? selectItem.classList.add(this.selectClasses.classSelectCheckBox)
        : selectItem.classList.remove(this.selectClasses.classSelectCheckBox);
      // Сеттер значения заголовка селекта
      this.setSelectTitleValue(selectItem, originalSelect);
      // Сеттер элементов списка (options)
      this.setOptions(selectItem, originalSelect);
      // Если включена опция поиска data-search, запускаем обработчик

      originalSelect.hasAttribute("data-search")
        ? this.searchActions(selectItem)
        : null;
      // Если указана настройка data-open, открываем селект
      originalSelect.hasAttribute("data-open")
        ? this.selectAction(selectItem)
        : null;
      // Обработчик disabled
      this.selectDisabled(selectItem, originalSelect);
    }
    // Функция реакций на события
    selectsActions(e) {
      const targetElement = e.target;
      const targetType = e.type;

      if (
        targetElement.closest(
          this.getSelectClass(this.selectClasses.classSelect),
        ) ||
        targetElement.closest(
          this.getSelectClass(this.selectClasses.classSelectTag),
        )
      ) {
        const selectItem = targetElement.closest(".select")
          ? targetElement.closest(".select")
          : document.querySelector(
              `.${this.selectClasses.classSelect}[data-id="${
                targetElement.closest(
                  this.getSelectClass(this.selectClasses.classSelectTag),
                ).dataset.selectId
              }"]`,
            );
        const originalSelect = this.getSelectElement(selectItem).originalSelect;
        if (targetType === "click") {
          if (!originalSelect.disabled) {
            if (
              targetElement.closest(
                this.getSelectClass(this.selectClasses.classSelectTag),
              )
            ) {
              // Обработка клика на тег
              const targetTag = targetElement.closest(
                this.getSelectClass(this.selectClasses.classSelectTag),
              );
              const optionItem = document.querySelector(
                `.${this.selectClasses.classSelect}[data-id="${targetTag.dataset.selectId}"] .select__option[data-value="${targetTag.dataset.value}"]`,
              );
              this.optionAction(selectItem, originalSelect, optionItem);
            } else if (
              targetElement.closest(
                this.getSelectClass(this.selectClasses.classSelectTitle),
              )
            ) {
              // Обработка клика на заголовок селекта
              this.selectAction(selectItem);
            } else if (
              targetElement.closest(
                this.getSelectClass(this.selectClasses.classSelectOption),
              )
            ) {
              // Обработка клика на элемент селекта
              const optionItem = targetElement.closest(
                this.getSelectClass(this.selectClasses.classSelectOption),
              );

              this.optionAction(selectItem, originalSelect, optionItem);
            }
          }
        } else if (targetType === "focusin") {
          if (
            targetElement.closest(
              this.getSelectClass(this.selectClasses.classSelect),
            )
          ) {
            // document.querySelector('.select__input').select();
            // document.querySelector('.select__input').value = '';
            const selectOptions = this.getSelectElement(
              selectItem,
              this.selectClasses.classSelectOptions,
            ).selectElement;
            const selectOptionsItems = selectOptions.querySelectorAll(
              `.${this.selectClasses.classSelectOption}`,
            );
            // selectOptionsItems.forEach((element) => {
            //   element.hidden = false;
            // });
            selectItem.classList.add(this.selectClasses.classSelectFocus);
            // targetType === 'focusin'
            //   ? selectItem.classList.add(this.selectClasses.classSelectFocus)
            //   : selectItem.classList.remove(this.selectClasses.classSelectFocus);
          }
        } else if (targetType === "focusout") {
          if (
            targetElement.closest(
              this.getSelectClass(this.selectClasses.classSelect),
            )
          ) {
            selectItem.classList.remove(this.selectClasses.classSelectFocus);
          }
        } else if (targetType === "keydown" && e.code === "Escape") {
          this.selectsСlose();
        } else if (targetType === "input") {
          this.searchActions(selectItem);
        }
      } else {
        this.selectsСlose();
      }
    }

    // Функция закрытия всех селектов
    selectsСlose() {
      const selectActiveItems = document.querySelectorAll(
        `${this.getSelectClass(
          this.selectClasses.classSelect,
        )}${this.getSelectClass(this.selectClasses.classSelectOpen)}`,
      );
      if (selectActiveItems.length) {
        selectActiveItems.forEach((selectActiveItem) => {
          this.selectAction(selectActiveItem);
        });
      }
    }
    // Функция открытия/закрытия конкретного селекта
    selectAction(selectItem) {
      const originalSelect = this.getSelectElement(selectItem).originalSelect;
      const selectOptions = this.getSelectElement(
        selectItem,
        this.selectClasses.classSelectOptions,
      ).selectElement;
      if (!selectOptions.classList.contains("_slide")) {
        selectItem.classList.toggle(this.selectClasses.classSelectOpen);

        _slideToggle(selectOptions, originalSelect.dataset.speed);
      }
    }
    // Сеттер значения заголовка селекта
    setSelectTitleValue(selectItem, originalSelect) {
      const selectItemBody = this.getSelectElement(
        selectItem,
        this.selectClasses.classSelectBody,
      ).selectElement;
      const selectItemTitle = this.getSelectElement(
        selectItem,
        this.selectClasses.classSelectTitle,
      ).selectElement;
      if (selectItemTitle) selectItemTitle.remove();
      selectItemBody.insertAdjacentHTML(
        "afterbegin",
        this.getSelectTitleValue(selectItem, originalSelect),
      );
    }
    // Конструктор значения заголовка
    getSelectTitleValue(selectItem, originalSelect) {
      // Получаем выбранные текстовые значения
      let selectTitleValue = this.getSelectedOptionsData(
        originalSelect,
        2,
      ).html;
      // Обработка значений мультивыбора
      // Если включен режим тегов (указана настройка data-tags)
      if (originalSelect.multiple && originalSelect.hasAttribute("data-tags")) {
        selectTitleValue = this.getSelectedOptionsData(originalSelect)
          .elements.map(
            (option) =>
              `<span role="button" data-select-id="${
                selectItem.dataset.id
              }" data-value="${
                option.value
              }" class="_select-tag">${this.getSelectElementContent(
                option,
              )}</span>`,
          )
          .join("");
        // Если вывод тегов во внешний блок
        if (
          originalSelect.dataset.tags &&
          document.querySelector(originalSelect.dataset.tags)
        ) {
          document.querySelector(originalSelect.dataset.tags).innerHTML =
            selectTitleValue;
          if (originalSelect.hasAttribute("data-search"))
            selectTitleValue = false;
        }
      }
      // Значение(я) или плейсхолдер
      selectTitleValue = selectTitleValue.length
        ? selectTitleValue
        : originalSelect.dataset.placeholder;
      // Если есть значение, добавляем класс
      this.getSelectedOptionsData(originalSelect).values.length
        ? selectItem.classList.add(this.selectClasses.classSelectActive)
        : selectItem.classList.remove(this.selectClasses.classSelectActive);
      // Возвращаем поле ввода для поиска или текст
      if (originalSelect.hasAttribute("data-search")) {
        // Выводим поле ввода для поиска
        // value="${selectTitleValue}"
        return `<div class="${this.selectClasses.classSelectTitle}"><span class="${this.selectClasses.classSelectValue}"><input  autocomplete="off" type="text" placeholder="${selectTitleValue}"  data-placeholder="${selectTitleValue}" class="${this.selectClasses.classSelectInput}"></span></div>`;
      } else {
        // Если выбран элемент со своим классом
        const customClass =
          this.getSelectedOptionsData(originalSelect).elements.length &&
          this.getSelectedOptionsData(originalSelect).elements[0].dataset.class
            ? ` ${
                this.getSelectedOptionsData(originalSelect).elements[0].dataset
                  .class
              }`
            : "";
        // Выводим текстовое значение
        return `<button type="button" class="${this.selectClasses.classSelectTitle}"><span class="${this.selectClasses.classSelectValue}"><span class="${this.selectClasses.classSelectContent}${customClass}">${selectTitleValue}</span></span></button>`;
      }
    }
    // Конструктор данных для значения заголовка
    getSelectElementContent(selectOption) {
      // Если для элемента указан вывод картинки или текста, перестраиваем конструкцию
      const selectOptionData = selectOption.dataset.asset
        ? `${selectOption.dataset.asset}`
        : "";
      const selectOptionDataHTML =
        selectOptionData.indexOf("img") >= 0
          ? `<img src="${selectOptionData}" alt="">`
          : selectOptionData;
      let selectOptionContentHTML = ``;
      selectOptionContentHTML += selectOptionData
        ? `<span class="${this.selectClasses.classSelectRow}">`
        : "";
      selectOptionContentHTML += selectOptionData
        ? `<span class="${this.selectClasses.classSelectData}">`
        : "";
      selectOptionContentHTML += selectOptionData ? selectOptionDataHTML : "";
      selectOptionContentHTML += selectOptionData ? `</span>` : "";
      selectOptionContentHTML += selectOptionData
        ? `<span class="${this.selectClasses.classSelectText}">`
        : "";
      selectOptionContentHTML += selectOption.textContent;
      selectOptionContentHTML += selectOptionData ? `</span>` : "";
      selectOptionContentHTML += selectOptionData ? `</span>` : "";
      return selectOptionContentHTML;
    }
    // Получение данных плейсхолдера
    getSelectPlaceholder(originalSelect) {
      const selectPlaceholder = Array.from(originalSelect.options).find(
        (option) => !option.value,
      );
      if (selectPlaceholder) {
        return {
          value: selectPlaceholder.textContent,
          show: selectPlaceholder.hasAttribute("data-show"),
          label: {
            show: selectPlaceholder.hasAttribute("data-label"),
            text: selectPlaceholder.dataset.label,
          },
        };
      }
    }
    // Получение данных из выбранных элементов
    getSelectedOptionsData(originalSelect, type) {
      // Получаем все выбранные объекты из select
      let selectedOptions = [];
      if (originalSelect.multiple) {
        // Если мультивыбор
        // Убираем плейсхолдер, получаем остальные выбранные элементы
        selectedOptions = Array.from(originalSelect.options)
          .filter((option) => option.value)
          .filter((option) => option.selected);
      } else {
        // Если единичный выбор
        selectedOptions.push(
          originalSelect.options[originalSelect.selectedIndex],
        );
      }
      return {
        elements: selectedOptions.map((option) => option),
        values: selectedOptions
          .filter((option) => option.value)
          .map((option) => option.value),
        html: selectedOptions.map((option) =>
          this.getSelectElementContent(option),
        ),
      };
    }
    // Конструктор элементов списка
    getOptions(originalSelect) {
      // Настрока скролла элементов
      let selectOptionsScroll = originalSelect.hasAttribute("data-scroll")
        ? `data-simplebar`
        : "";
      let selectOptionsScrollHeight = originalSelect.dataset.scroll
        ? `style="max-height:${originalSelect.dataset.scroll}px"`
        : "";
      // Получаем элементы списка
      let selectOptions = Array.from(originalSelect.options);
      if (selectOptions.length > 0) {
        let selectOptionsHTML = ``;
        // Если указана настройка data-show, показываем плейсхолдер в списке
        if (
          (this.getSelectPlaceholder(originalSelect) &&
            !this.getSelectPlaceholder(originalSelect).show) ||
          originalSelect.multiple
        ) {
          selectOptions = selectOptions.filter((option) => option.value);
        }
        // Строим и выводим основную конструкцию
        selectOptionsHTML += selectOptionsScroll
          ? `<div ${selectOptionsScroll} ${selectOptionsScrollHeight} class="${this.selectClasses.classSelectOptionsScroll}">`
          : "";
        selectOptions.forEach((selectOption) => {
          // Получаем конструкцию конкретного элемента списка
          selectOptionsHTML += this.getOption(selectOption, originalSelect);
        });
        selectOptionsHTML += selectOptionsScroll ? `</div>` : "";
        return selectOptionsHTML;
      }
    }
    // Конструктор конкретного элемента списка
    getOption(selectOption, originalSelect) {
      // Если элемент выбран и включен режим мультивыбора, добавляем класс
      const selectOptionSelected =
        selectOption.selected && originalSelect.multiple
          ? ` ${this.selectClasses.classSelectOptionSelected}`
          : "";
      // Если элемент выбрани нет настройки data-show-selected, скрываем элемент
      const selectOptionHide =
        selectOption.selected &&
        !originalSelect.hasAttribute("data-show-selected")
          ? `hidden`
          : ``;
      // Если для элемента указан класс добавляем
      const selectOptionClass = selectOption.dataset.class
        ? ` ${selectOption.dataset.class}`
        : "";
      // Если указан режим ссылки
      const selectOptionLink = selectOption.dataset.href
        ? selectOption.dataset.href
        : false;
      const selectOptionLinkTarget = selectOption.hasAttribute(
        "data-href-blank",
      )
        ? `target="_blank"`
        : "";
      // Строим и возвращаем конструкцию элемента
      let selectOptionHTML = ``;
      selectOptionHTML += selectOptionLink
        ? `<a ${selectOptionLinkTarget} ${selectOptionHide} href="${selectOptionLink}" data-value="${selectOption.value}" class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}">`
        : `<button ${selectOptionHide} class="${this.selectClasses.classSelectOption}${selectOptionClass}${selectOptionSelected}" data-value="${selectOption.value}" type="button">`;
      selectOptionHTML += this.getSelectElementContent(selectOption);
      selectOptionHTML += selectOptionLink ? `</a>` : `</button>`;
      return selectOptionHTML;
    }
    // Сеттер элементов списка (options)
    setOptions(selectItem, originalSelect) {
      // Получаем объект тела псевдоселекта
      const selectItemOptions = this.getSelectElement(
        selectItem,
        this.selectClasses.classSelectOptions,
      ).selectElement;
      // Запускаем конструктор элементов списка (options) и добавляем в тело псевдоселекта
      selectItemOptions.innerHTML = this.getOptions(originalSelect);
    }
    // Обработчик клика на элемент списка
    optionAction(selectItem, originalSelect, optionItem) {
      if (originalSelect.multiple) {
        // Если мультивыбор
        // Выделяем классом элемент
        optionItem.classList.toggle(
          this.selectClasses.classSelectOptionSelected,
        );
        // Очищаем выбранные элементы
        const originalSelectSelectedItems =
          this.getSelectedOptionsData(originalSelect).elements;
        originalSelectSelectedItems.forEach((originalSelectSelectedItem) => {
          originalSelectSelectedItem.removeAttribute("selected");
        });
        // Выбираем элементы
        const selectSelectedItems = selectItem.querySelectorAll(
          this.getSelectClass(this.selectClasses.classSelectOptionSelected),
        );
        selectSelectedItems.forEach((selectSelectedItems) => {
          originalSelect
            .querySelector(
              `option[value="${selectSelectedItems.dataset.value}"]`,
            )
            .setAttribute("selected", "selected");
        });
      } else {
        // Если единичный выбор
        // Если не указана настройка data-show-selected, скрываем выбранный элемент
        if (!originalSelect.hasAttribute("data-show-selected")) {
          // Сначала все показать
          if (
            selectItem.querySelector(
              `${this.getSelectClass(
                this.selectClasses.classSelectOption,
              )}[hidden]`,
            )
          ) {
            selectItem.querySelector(
              `${this.getSelectClass(
                this.selectClasses.classSelectOption,
              )}[hidden]`,
            ).hidden = false;
          }
          // Скрываем выбранную
          optionItem.hidden = true;
        }
        originalSelect.value = optionItem.hasAttribute("data-value")
          ? optionItem.dataset.value
          : optionItem.textContent;
        this.selectAction(selectItem);
      }
      // Обновляем заголовок селекта
      this.setSelectTitleValue(selectItem, originalSelect);
      // Вызываем реакцию на изменение селекта
      this.setSelectChange(originalSelect);
    }
    // Реакция на измененение оригинального select
    selectChange(e) {
      const originalSelect = e.target;
      this.selectBuild(originalSelect);
      this.setSelectChange(originalSelect);
    }
    // Обработчик изменения в селекте
    setSelectChange(originalSelect) {
      const btnSum = document.querySelector(".calc-wells__btn");
      const oneSelect = document.querySelector('select[data-id="1"]');
      const calcObustroystva = document.getElementById("obustroystva-calc");
      let valueDepth;

      if (
        document.querySelector(".select__input") &&
        document.querySelector(".calc-wells__inpt")
      ) {
        valueDepth =
          document.querySelector(".calc-wells__inpt").value ||
          document.querySelector(".select__input").dataset.placeholder;
      }
      debugger;
      if (
        !calcObustroystva &&
        originalSelect.dataset.id == 1 &&
        oneSelect.value &&
        valueDepth
      ) {
        btnSum.classList.remove("_disable");
        btnSum.disabled = false;
      }
      if (
        calcObustroystva &&
        originalSelect.dataset.id == 2 &&
        btnSum &&
        document.querySelector(".calc-wells__inpt").value
      ) {
        btnSum.classList.remove("_disable");
        btnSum.disabled = false;
      }
      if (
        !calcObustroystva &&
        originalSelect.dataset.id == 3 &&
        btnSum &&
        document.querySelector(".select__input").dataset.placeholder &&
        oneSelect.value
      ) {
        btnSum.classList.remove("_disable");
        btnSum.disabled = false;
      }
      // Моментальная валидация селекта
      if (originalSelect.hasAttribute("data-validate")) {
        // formValidate.validateInput(originalSelect);
      }
      // При изменении селекта отправляем форму

      if (originalSelect.hasAttribute("data-submit") && originalSelect.value) {
        let tempButton = document.createElement("button");
        tempButton.type = "submit";
        originalSelect.closest("form").append(tempButton);
        tempButton.click();
        tempButton.remove();
      }
      const selectItem = originalSelect.parentElement;
      // Вызов коллбэк функции
      this.selectCallback(selectItem, originalSelect);
    }
    // Обработчик disabled
    selectDisabled(selectItem, originalSelect) {
      if (originalSelect.disabled) {
        selectItem.classList.add(this.selectClasses.classSelectDisabled);
        this.getSelectElement(
          selectItem,
          this.selectClasses.classSelectTitle,
        ).selectElement.disabled = true;
      } else {
        selectItem.classList.remove(this.selectClasses.classSelectDisabled);
        this.getSelectElement(
          selectItem,
          this.selectClasses.classSelectTitle,
        ).selectElement.disabled = false;
      }
    }
    // Обработчик поиска по элементам списка
    searchActions(selectItem) {
      // debugger;
      const originalSelect = this.getSelectElement(selectItem).originalSelect;
      const selectInput = this.getSelectElement(
        selectItem,
        this.selectClasses.classSelectInput,
      ).selectElement;
      const selectOptions = this.getSelectElement(
        selectItem,
        this.selectClasses.classSelectOptions,
      ).selectElement;
      const selectOptionsItems = selectOptions.querySelectorAll(
        `.${this.selectClasses.classSelectOption}`,
      );
      const _this = this;

      // selectInput.addEventListener('input', function () {
      selectOptionsItems.forEach((selectOptionsItem) => {
        // debugger;
        if (
          selectOptionsItem.textContent
            .toUpperCase()
            .indexOf(selectInput.value.toUpperCase()) >= 0
        ) {
          selectOptionsItem.hidden = false;
        } else {
          selectOptionsItem.hidden = true;
        }
      });
      // Если список закрыт открываем
      selectOptions.hidden === true ? _this.selectAction(selectItem) : null;
      // });
    }
    // Коллбэк функция
    selectCallback(selectItem, originalSelect) {
      document.dispatchEvent(
        new CustomEvent("selectCallback", {
          detail: {
            select: originalSelect,
          },
        }),
      );
    }
  }

  const selectCalc = new SelectConstructor();

  // ==============================================================
  // ==============================================================
  // калькуляторо для скважины
  // ==============================================================
  // ==============================================================

  function initCalcWells() {
    if (document.querySelector(".calc-wells")) {
      const oneSelect = document.querySelector('select[data-id="1"]');
      const twoSelect = document.querySelector(
        'select[name="Вид обустройства"]',
      );
      const threeSelect = document.querySelector(
        'select[name="Район бурения"]',
      );
      const inptCalc = document.querySelector(".calc-wells__inpt");
      const slectAreaCalc = document.querySelector(".calc-wells__select");
      const inptBtn = document.querySelector("#int");
      const calcBtn = document.querySelector("#calc");
      const sumBtn = document.querySelector(".calc-wells__btn");
      const imgBlock = document.querySelector(".calc-wells__bg-img");
      const finishBlock = document.querySelector(".calc-wells__finish");
      const calcObustroystva = document.getElementById("obustroystva-calc");

      const sumBlock = document.querySelector(".calc-wells__sum");
      let isActiv = true;
      let res = 0;
      if (document.querySelector(".select__input")) {
        document.querySelector(".select__input").dataset.placeholder = "";
      }
      isShowCaclTab();

      // преключаем между "Глубина скважины" и "Район бурения"
      function isShowCaclTab() {
        if (inptBtn) {
          inptBtn.addEventListener("click", (e) =>
            cliclBtn(calcBtn, inptBtn, inptCalc, slectAreaCalc, true),
          );
        }
        if (calcBtn) {
          calcBtn.addEventListener("click", (e) =>
            cliclBtn(inptBtn, calcBtn, slectAreaCalc, inptCalc, false),
          );
        }
        function cliclBtn(
          removeSelector,
          addSelector,
          isHiddenCalc,
          isHiddenInpt,
          booleanValue,
        ) {
          removeSelector.classList.remove("_active");
          addSelector.classList.add("_active");
          isHiddenInpt.hidden = true;
          isHiddenCalc.hidden = false;
          isActiv = booleanValue;
          inptCalc.value = "";
          sumBtn.classList.add("_disable");
          sumBtn.disabled = true;
          if (document.querySelector(".select__input")) {
            document.querySelector(".select__input").placeholder =
              "Район бурения";
            document.querySelector(".select__input").dataset.placeholder = "";
          }
        }
      }

      // кнопка "Рассчитать"
      sumBtn.addEventListener("click", resultCalc);

      function resultCalc(e) {
        let depthValue = isActiv
          ? inptCalc.value
          : findValueOption(threeSelect);
        let wellsValue =
          oneSelect.value === "Артезианская скважина" ? 3350 : 3250;
        let arrangementValue = twoSelect.value ? twoSelect.value : "";

        if (depthValue < 40) {
          depthValue = 40;
        }

        if (calcObustroystva) {
          let cablePrice = 300 + 100 + 170;

          let arrangementPrice = twoSelect.value;
          depthValue = +depthValue / 2;

          if (depthValue > 70) {
            cablePrice = 470 + 100 + 170;
          }

          res = String(+depthValue * +cablePrice + +arrangementPrice);
        } else {
          if (depthValue > 80) {
            wellsValue = wellsValue + 100;
          }
          res = String(+wellsValue * +depthValue + +arrangementValue);
        }

        const newRes = res
          .split("")
          .reverse()
          .map((it, indx) => {
            if (indx == 0) return it;
            if (indx % 3 == 0) {
              return `${it} `;
            }
            return it;
          })
          .reverse()
          .join("");

        if (res) {
          if (windowSizeUser()) {
            animatBlcok();
          } else {
            finishBlock.classList.add("_animat-mob");
          }
          finishBlock.hidden = false;
          sumBlock.innerHTML = `${newRes} р.`;
        }
      }
      // события на проверку на пустое значения
      // события  на ввод макс.глубину 250
      inptCalc.addEventListener("input", (event) => {
        const numMax = 250;

        if (event.target.value > numMax) {
          event.target.value = numMax;
          event.target.max = numMax;
        }

        if (calcObustroystva && twoSelect.value) {
          sumBtn.disabled = inptCalc.value.trim().length === 0;
          sumBtn.classList.remove("_disable");
        }
        if (inptCalc.value !== "" && oneSelect.value) {
          sumBtn.disabled = false;
          sumBtn.classList.remove("_disable");
          return;
        }
        if (inptCalc.value === "") {
          sumBtn.disabled = true;
          sumBtn.classList.add("_disable");
        }
      });
      // берем значения с "Район бурения"
      function findValueOption(select) {
        const option = select.querySelector(`option[value="${select.value}"]`);
        return option.dataset.valueDepth;
      }
      //анимация
      function animatBlcok() {
        imgBlock.classList.add("_animat");
        finishBlock.classList.add("_animat");
      }
      const calcWellsBtnSubmit = document.getElementById("calc-wells__finish");
      if (calcWellsBtnSubmit) {
        calcWellsBtnSubmit.addEventListener("submit", function (e) {
          e.preventDefault();

          var th = $(calcWellsBtnSubmit);
          $(".load__preloader").fadeIn("", function () {
            $.ajax({
              type: "POST",
              url: "/index.php?route=common/footer/quiz_submit",
              data: th.serialize(),
              dataType: "json",
            }).done(function (json) {
              if (json["success"]) {
                window.location.href = "https://sewera.ru/sent/";
                $(".load__preloader").fadeOut("slow");
              }
            });
          });

          return false;
        });
      }
    }
  }

  function windowSizeUser() {
    if (window.matchMedia("(min-width: 1023.98px)").matches) {
      return true;
    } else {
      pageNavigation();
      return false;
    }
  }

  window.addEventListener("resize", windowSizeUser);

  initCalcWells();
  // ==========================================================================
  // ==========================================================================
  // ==========================================================================
  function pageNavigation() {
    // data-goto - указать ID блока
    // data-goto-header - учитывать header
    // data-goto-speed - скорость (только если используется доп плагин)
    // Работаем при клике на пункт
    document.addEventListener("click", pageNavigationAction);
    // Если подключен scrollWatcher, подсвечиваем текущий пукт меню
    document.addEventListener("watcherCallback", pageNavigationAction);
    // Основная функция
    function pageNavigationAction(e) {
      if (e.type === "click") {
        const targetElement = e.target;
        if (targetElement.closest("[data-goto]")) {
          const gotoLink = targetElement.closest("[data-goto]");
          const gotoLinkSelector = gotoLink.dataset.goto
            ? gotoLink.dataset.goto
            : "";
          const noHeader = gotoLink.hasAttribute("data-goto-header")
            ? true
            : false;
          const gotoSpeed = gotoLink.dataset.gotoSpeed
            ? gotoLink.dataset.gotoSpeed
            : "500";
          gotoBlock(gotoLinkSelector, noHeader, gotoSpeed);
          e.preventDefault();
        }
      } else if (e.type === "watcherCallback") {
        if (e.detail) {
          const entry = e.detail.entry;
          const targetElement = entry.target;
          // Обработка пунктов навигации, если указано значение navigator подсвечиваем текущий пукт меню
          if (targetElement.dataset.watch === "navigator") {
            const navigatorItem = targetElement.id;
            const navigatorActiveItem = document.querySelector(
              `[data-goto]._navigator-active`,
            );
            const navigatorCurrentItem = document.querySelector(
              `[data-goto="${navigatorItem}"]`,
            );
            if (entry.isIntersecting) {
              // Видим объект
              // navigatorActiveItem ? navigatorActiveItem.classList.remove('_navigator-active') : null;
              navigatorCurrentItem
                ? navigatorCurrentItem.classList.add("_navigator-active")
                : null;
            } else {
              // Не видим объект
              navigatorCurrentItem
                ? navigatorCurrentItem.classList.remove("_navigator-active")
                : null;
            }
          }
        }
      }
    }
  }
  // Модуль плавной проктутки к блоку
  let gotoBlock = (targetBlock, noHeader = false, speed = 500, offset = 0) => {
    const targetBlockElement = document.querySelector(targetBlock);
    if (targetBlockElement) {
      let headerItem = "";
      let headerItemHeight = 0;
      if (noHeader) {
        headerItem = "header.header";
        headerItemHeight = document.querySelector(headerItem).offsetHeight;
      }
      let options = {
        speedAsDuration: true,
        speed: speed,
        header: headerItem,
        offset: offset,
        easing: "easeOutQuad",
      };
      // Закрываем меню, если оно открыто
      document.documentElement.classList.contains("menu-open")
        ? menuClose()
        : null;

      if (typeof SmoothScroll !== "undefined") {
        // Прокрутка с использованием дополнения
        new SmoothScroll().animateScroll(targetBlockElement, "", options);
      } else {
        // Прокрутка стандартными средствами
        let targetBlockElementPosition =
          targetBlockElement.getBoundingClientRect().top + scrollY;
        window.scrollTo({
          top: headerItemHeight
            ? targetBlockElementPosition - headerItemHeight
            : targetBlockElementPosition,
          behavior: "smooth",
        });
      }
    } else {
    }
  };
  let boreholes = [
    {
      id: 1,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.701934", "38.404676"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 38м",
        balloonContentBody:
          'Адрес: <b>Ивцино, Ярославская обл., Мышкинский рн.</b> <br> Глубина: </b>38 м</b> <br> Статус: <b>Песчаная скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Ивцино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "38м",
      },
    },
    {
      id: 2,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.735837", "38.470154"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 31м",
        balloonContentBody:
          'Кирьяново, Ярославская обл., Мышкинский р-он <br> Глубина: 31 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Кирьяново" data-id="#consultationForm2">Заказать</button>',
        iconContent: "31м",
      },
    },
    {
      id: 3,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["58.043648", "38.392648"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 22м",
        balloonContentBody:
          'Селехово <br> Глубина: 22 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Селехово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "22м",
      },
    },
    {
      id: 4,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.466721", "39.530382"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 71м",
        balloonContentBody:
          'Воронково, Гаврилово-Ямский р-он <br> Глубина: 71 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Воронково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "71м",
      },
    },
    {
      id: 5,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.385563", "38.174779"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 45.5м",
        balloonContentBody:
          'Ярославская обл., Углич. р-он, ККП"Нефтино", участок 31 <br> Глубина: 45.5 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Нефтино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "45.5м",
      },
    },
    {
      id: 6,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.290734", "37.968643"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 40м",
        balloonContentBody:
          'Тверская обл, Калязинский р-он, д. Васюсино <br> Глубина: 40 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Васюсино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "40м",
      },
    },
    {
      id: 7,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.290734", "37.968643"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 35м",
        balloonContentBody:
          'Васюсино <br> Глубина: 35 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Васюсино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "35м",
      },
    },
    {
      id: 8,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.286701", "37.942682"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 38м",
        balloonContentBody:
          'Тверская обл., Калязинский р-он, Носово <br> Глубина: 38 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Носово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "38м",
      },
    },
    {
      id: 9,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.287217", "37.943368"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 32м",
        balloonContentBody:
          'Носово <br> Глубина: 32 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Носово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "32м",
      },
    },
    {
      id: 10,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.177660", "37.943652"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 45м",
        balloonContentBody:
          'Заручье <br> Глубина: 45 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Заручье" data-id="#consultationForm2">Заказать</button>',
        iconContent: "45м",
      },
    },
    {
      id: 11,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.220806", "37.745335"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 36м",
        balloonContentBody:
          'Деревня Авсергово <br> Глубина: 36 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Деревня Авсергово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "36м",
      },
    },
    {
      id: 12,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.218586", "37.709353"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 59м",
        balloonContentBody:
          'Домажино <br> Глубина: 59 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Домажино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "59м",
      },
    },
    {
      id: 13,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.166881", "37.632332"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 45м",
        balloonContentBody:
          'Харлово <br> Глубина: 45 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Харлово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "45м",
      },
    },
    {
      id: 14,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.163463", "37.631170"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 35.5м",
        balloonContentBody:
          'Кашинский городской округ <br> Глубина: 35.5 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Кашинский городской округ" data-id="#consultationForm2">Заказать</button>',
        iconContent: "35.5м",
      },
    },
    {
      id: 15,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.163671", "37.631860"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 30",
        balloonContentBody:
          'Кашинский городской округ <br> Глубина: 30 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Кашинский городской округ" data-id="#consultationForm2">Заказать</button>',
        iconContent: "30м",
      },
    },
    {
      id: 16,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.168258", "37.633113"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 40м",
        balloonContentBody:
          'Тверская область, Кашинский район, д.Харлово, ул. Новохарлово, д.3 <br> Глубина: 40 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Харлово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "40м",
      },
    },
    {
      id: 17,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.016208", "38.033870"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 42м",
        balloonContentBody:
          'Деревня Устье, 39 <br> Глубина: 42 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Деревня Устье" data-id="#consultationForm2">Заказать</button>',
        iconContent: "42м",
      },
    },
    {
      id: 18,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.010063", "38.584106"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 36м",
        balloonContentBody:
          'Деревня Брынчаги, 39 <br> Глубина: 36 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Брынчаги" data-id="#consultationForm2">Заказать</button>',
        iconContent: "36м",
      },
    },
    {
      id: 19,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.890811", "37.728344"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 110м",
        balloonContentBody:
          'Деревня Ульянцево <br> Глубина: 110 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Ульянцево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "110м",
      },
    },
    {
      id: 20,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.912340", "39.072394"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 73м",
        balloonContentBody:
          'Ярославская обл, Переславский р-он, Романово, СНТ "Вашутино" <br> Глубина: 73 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Романово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "73м",
      },
    },
    {
      id: 21,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.930700", "39.072159"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 37м",
        balloonContentBody:
          'Деревня Ершово <br> Глубина: 37 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Ершово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "37м",
      },
    },
    {
      id: 22,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.940207", "39.293721"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 43м",
        balloonContentBody:
          'Посёлок Хмельники <br> Глубина: 43 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Хмельники" data-id="#consultationForm2">Заказать</button>',
        iconContent: "43м",
      },
    },
    {
      id: 23,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.978610", "39.296065"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 120м",
        balloonContentBody:
          'Ярославская Область, Ростовский Район, деревня Щипачево <br> Глубина: 120 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Щипачево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "120м",
      },
    },
    {
      id: 24,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.142023", "39.169286"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 53м",
        balloonContentBody:
          'Яросласвкая обл., Ростовский р-он., Алевайцыно <br> Глубина: 53 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Алевайцыно" data-id="#consultationForm2">Заказать</button>',
        iconContent: "53м",
      },
    },
    {
      id: 25,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.146075", "39.182460"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 138м",
        balloonContentBody:
          'Сельское поселение Ишня <br> Глубина: 138 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Ишня" data-id="#consultationForm2">Заказать</button>',
        iconContent: "138м",
      },
    },
    {
      id: 26,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.466721", "39.530382"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 71м",
        balloonContentBody:
          'Воронково, Гаврилово-Ямский р-он <br> Глубина: 71 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Воронково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "71м",
      },
    },
    {
      id: 27,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["57.466721", "39.530382"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 71м",
        balloonContentBody:
          'Воронково, Гаврилово-Ямский р-он <br> Глубина: 71 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Воронково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "71м",
      },
    },
    {
      id: 28,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.722583", "38.782615"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 101м",
        balloonContentBody:
          'Веськово, Переславский рн, Ярославская обл. <br> Глубина: 101 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Веськово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "101м",
      },
    },
    {
      id: 29,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.730237", "38.736976"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 42м",
        balloonContentBody:
          'Веслево <br> Глубина: 42 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Веслево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "42м",
      },
    },
    {
      id: 30,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.734190", "38.730550"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 42м",
        balloonContentBody:
          '1-я Холодная улица <br> Глубина: 42 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Холодная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "42м",
      },
    },
    {
      id: 31,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.716611", "38.347570"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 60м",
        balloonContentBody:
          'Ярославская обл., Переславский р-он, Кубринск, ул.Лесная, д.14 <br> Глубина: 60 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Кубринск" data-id="#consultationForm2">Заказать</button>',
        iconContent: "60м",
      },
    },
    {
      id: 32,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.717554", "38.359734"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 63м",
        balloonContentBody:
          'Село Кубринск <br> Глубина: 63 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Кубринск" data-id="#consultationForm2">Заказать</button>',
        iconContent: "63м",
      },
    },
    {
      id: 33,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.717554", "38.359734"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 210м",
        balloonContentBody:
          'Деревня. Конищево, Александровский район, Владимирская обл. <br> Глубина: 210 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Конищево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "210м",
      },
    },
    {
      id: 34,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.616848", "38.364117"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 229м",
        balloonContentBody:
          'СК Альфа <br> Глубина: 229 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Альфа" data-id="#consultationForm2">Заказать</button>',
        iconContent: "229м",
      },
    },
    {
      id: 35,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.551546", "38.194731"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 53м",
        balloonContentBody:
          'Московская область, Сергиево-Посадский район, Трехселище <br> Глубина: 53 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Трехселище" data-id="#consultationForm2">Заказать</button>',
        iconContent: "53м",
      },
    },
    {
      id: 36,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.532454", "38.266129"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 51м",
        balloonContentBody:
          'Ваулино СНТ Ландыш <br> Глубина: 51 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Ландыш" data-id="#consultationForm2">Заказать</button>',
        iconContent: "51м",
      },
    },
    {
      id: 37,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.532413", "38.255827"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 68м",
        balloonContentBody:
          'Деревня Ваулино <br> Глубина: 68 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Ваулино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "68м",
      },
    },
    {
      id: 38,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.532127", "38.252052"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 71м",
        balloonContentBody:
          'Деревня Ваулино, 3 <br> Глубина: 71 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Деревня Ваулино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "71м",
      },
    },
    {
      id: 39,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.405209", "38.369280"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 52м",
        balloonContentBody:
          'Хутор Шубино <br> Глубина: 52 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Шубино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "52м",
      },
    },
    {
      id: 40,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.401754", "38.426281"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 31м",
        balloonContentBody:
          'Деревня Федяйково <br> Глубина: 31 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Федяйково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "31м",
      },
    },
    {
      id: 41,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.389301", "38.503060"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 140м",
        balloonContentBody:
          'Владимирская обл., Александровский р-н, д. Жуклино, СНТ Родник, дом. 123 <br> Глубина: 140 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Жуклино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "140м",
      },
    },
    {
      id: 42,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.350003", "39.383047"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 49м",
        balloonContentBody:
          'Прокудино <br> Глубина: 49 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Прокудино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "49м",
      },
    },
    {
      id: 43,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.321157", "39.405417"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 57м",
        balloonContentBody:
          'Деревня Литвиново <br> Глубина: 57 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Литвиново" data-id="#consultationForm2">Заказать</button>',
        iconContent: "57м",
      },
    },
    {
      id: 44,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.427642", "39.922815"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 63.4м",
        balloonContentBody:
          'Село Фёдоровское <br> Глубина: 63.4 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Фёдоровское" data-id="#consultationForm2">Заказать</button>',
        iconContent: "63.4м",
      },
    },
    {
      id: 45,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.118425", "40.337087"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 140м",
        balloonContentBody:
          'Пригородная улица, 50 <br> Глубина: 140 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Пригородная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "140м",
      },
    },
    {
      id: 46,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.079789", "40.495442"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 87м",
        balloonContentBody:
          'Центральная улица, 52А <br> Глубина: 87 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Центральная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "87м",
      },
    },
    {
      id: 47,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.987286", "40.554255"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'Деревня Ефимовская <br> Глубина: 90 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Деревня Ефимовская" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 48,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.060554", "40.772617"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 53м",
        balloonContentBody:
          'Деревня Торжково <br> Глубина: 53 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Торжково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "53м",
      },
    },
    {
      id: 49,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.364022", "41.290514"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 80м",
        balloonContentBody:
          'Локомотивная улица, 11с5 <br> Глубина: 80 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Локомотивная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "80м",
      },
    },
    {
      id: 50,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.829775", "41.057725"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 100м",
        balloonContentBody:
          'Центральная улица, 41 <br> Глубина: 100 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Центральная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "100м",
      },
    },
    {
      id: 51,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.767889", "41.411149"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 26м",
        balloonContentBody:
          'Деревня Ознобишино <br> Глубина: 26 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Деревня Ознобишино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "26м",
      },
    },
    {
      id: 52,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.858049", "45.695834"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 70м",
        balloonContentBody:
          'Село Спасское <br> Глубина: 70 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Спасское" data-id="#consultationForm2">Заказать</button>',
        iconContent: "70м",
      },
    },
    {
      id: 53,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.937392", "39.460035"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 100м",
        balloonContentBody:
          'Г. Петушки, Улица 3-го Интернационала <br> Глубина: 100 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Петушки" data-id="#consultationForm2">Заказать</button>',
        iconContent: "100м",
      },
    },
    {
      id: 54,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.904528", "39.312577"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 70м",
        balloonContentBody:
          'Владимирская обл., Петушинский р-он., Старые Омутищи, ул.Первомайская, д.10 <br> Глубина: 70 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Старые Омутищи" data-id="#consultationForm2">Заказать</button>',
        iconContent: "70м",
      },
    },
    {
      id: 55,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.934260", "39.325872"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 63м",
        balloonContentBody:
          'СНТ Чародеи <br> Глубина: 63 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Чародеи" data-id="#consultationForm2">Заказать</button>',
        iconContent: "63м",
      },
    },
    {
      id: 55,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.935374", "39.325185"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 63м",
        balloonContentBody:
          'СНТ Чародеи <br> Глубина: 63 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Чародеи" data-id="#consultationForm2">Заказать</button>',
        iconContent: "63м",
      },
    },
    {
      id: 56,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.949707", "39.240109"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 91м",
        balloonContentBody:
          'Владимирсккая область, Петушинский район, п.Вольгинский <br> Глубина: 91 м <br><button class="open-modal ya-btn-marker open-modal" data-form="п.Вольгинский" data-id="#consultationForm2">Заказать</button>',
        iconContent: "91м",
      },
    },
    {
      id: 57,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.929298", "39.044699"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 60м",
        balloonContentBody:
          'Владимирская обл., Петушинский р-он, Островищи <br> Глубина: 60 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Островищи" data-id="#consultationForm2">Заказать</button>',
        iconContent: "60м",
      },
    },
    {
      id: 58,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.890759", "38.956781"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 69м",
        balloonContentBody:
          'Орехово-Зуевский район, дер. Трусово, дом 4 <br> Глубина: 69 м <br><button class="open-modal ya-btn-marker open-modal" data-form="дер. Трусово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "69м",
      },
    },
    {
      id: 58,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.887175", "38.910365"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 57м",
        balloonContentBody:
          'Орехово-Зуевский р-он, Малая Дубна, СНТ "Старт-2", уч.1/3 <br> Глубина: 57 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ "Старт-2"" data-id="#consultationForm2">Заказать</button>',
        iconContent: "57м",
      },
    },
    {
      id: 59,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.875501", "38.893899"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 70м",
        balloonContentBody:
          'Деревня Никулино, дом 65, Орехово-Зуевский район <br> Глубина: 70 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Деревня Никулино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "70м",
      },
    },
    {
      id: 60,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.852309", "38.853169"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 49м",
        balloonContentBody:
          'Орехово-Зуевский р-он, д.Плотава, д.16 <br> Глубина: 49 м <br><button class="open-modal ya-btn-marker open-modal" data-form="д.Плотава" data-id="#consultationForm2">Заказать</button>',
        iconContent: "49м",
      },
    },
    {
      id: 61,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.895610", "38.767299"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 66м",
        balloonContentBody:
          'Г. Электрогорск, ул. Линейная, 1 А. <br> Глубина: 66 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Электрогорск" data-id="#consultationForm2">Заказать</button>',
        iconContent: "66м",
      },
    },
    {
      id: 62,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.916751", "38.767158"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 48м",
        balloonContentBody:
          'Павловский Посад, СНТ "Ландыши", 10-я линия <br> Глубина: 48 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ "Ландыши"" data-id="#consultationForm2">Заказать</button>',
        iconContent: "48м",
      },
    },
    {
      id: 63,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.918535", "38.766208"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 39м",
        balloonContentBody:
          'Садовое товарищество Ландыш <br> Глубина: 39 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Садовое товарищество Ландыш" data-id="#consultationForm2">Заказать</button>',
        iconContent: "39м",
      },
    },
    {
      id: 64,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.921804", "38.751988"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 81м",
        balloonContentBody:
          'Павлово-Посадский городской округ <br> Глубина: 81 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Павлово-Посадский городской округ" data-id="#consultationForm2">Заказать</button>',
        iconContent: "81м",
      },
    },
    {
      id: 65,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.921446", "38.740454"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 114м",
        balloonContentBody:
          'Павло-Посадский р-он, д.Васютино <br> Глубина: 114 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Васютино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "114м",
      },
    },
    {
      id: 66,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.928485", "38.747763"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 108м",
        balloonContentBody:
          'Деревня Васютино <br> Глубина: 108 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Васютино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "108м",
      },
    },
    {
      id: 67,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.974781", "38.720770"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 42м",
        balloonContentBody:
          'Павлово-Посадский р-он, ул. Дальняя, снт "Кооператор", участок 18 <br> Глубина: 42 м <br><button class="open-modal ya-btn-marker open-modal" data-form="снт Кооператор" data-id="#consultationForm2">Заказать</button>',
        iconContent: "42м",
      },
    },
    {
      id: 68,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.971608", "38.695756"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 39м",
        balloonContentBody:
          'Павло-Посадский р-он, д. Дальняя, СНТ "Подснежник" <br> Глубина: 39 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Подснежник" data-id="#consultationForm2">Заказать</button>',
        iconContent: "39м",
      },
    },
    {
      id: 69,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.939792", "38.656375"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 47м",
        balloonContentBody:
          'СНТ"КРИОС", 1-я улица" <br> Глубина: 47 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ КРИОС" data-id="#consultationForm2">Заказать</button>',
        iconContent: "47м",
      },
    },
    {
      id: 70,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.965418", "38.646902"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'Павлово-Посадский городской округ <br> Глубина: 90 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Павлово-Посадский городской округ" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 71,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.933343", "38.632525"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 40м",
        balloonContentBody:
          'Богородский городской округ, массив дачной застройки, Тимковские Поляны, 48 <br> Глубина: 40 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Тимковские Поляны" data-id="#consultationForm2">Заказать</button>',
        iconContent: "40м",
      },
    },
    {
      id: 72,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.948350", "38.588791"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 140м",
        balloonContentBody:
          'Деревня Гаврилово <br> Глубина: 140 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Деревня Гаврилово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "140м",
      },
    },
    {
      id: 73,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.961315", "38.587803"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 143м",
        balloonContentBody:
          'Деревня Следово <br> Глубина: 143 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Деревня Гаврилово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "143м",
      },
    },
    {
      id: 74,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.983852", "38.526551"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Ногинский р-он, Щекавцево, Речная, д. 81 "А" <br> Глубина: 50 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Щекавцево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 75,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.902273", "38.630998"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 37м",
        balloonContentBody:
          'Ногинский р-н, д. Тимково, СНТ Искра, уч. 159 <br> Глубина: 37 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Искра" data-id="#consultationForm2">Заказать</button>',
        iconContent: "37м",
      },
    },
    {
      id: 76,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.884999", "38.561720"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 42м",
        balloonContentBody:
          'Бабёнки, СНТ Весна, уч. 92 <br> Глубина: 42 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Весна" data-id="#consultationForm2">Заказать</button>',
        iconContent: "42м",
      },
    },
    {
      id: 77,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.871885", "38.605126"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 32м",
        balloonContentBody:
          'СНТ "Электрон", уч.167 <br> Глубина: 32 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Электрон" data-id="#consultationForm2">Заказать</button>',
        iconContent: "32м",
      },
    },
    {
      id: 78,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.862284", "38.616466"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 28м",
        balloonContentBody:
          'Деревня Большое Буньково, СНТ "Полянка" <br> Глубина: 28 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Полянка" data-id="#consultationForm2">Заказать</button>',
        iconContent: "28м",
      },
    },
    {
      id: 79,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.859447", "38.622910"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 30м",
        balloonContentBody:
          'Снт "Полянка" ул. Западная <br> Глубина: 30 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Полянка" data-id="#consultationForm2">Заказать</button>',
        iconContent: "30м",
      },
    },
    {
      id: 80,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.855897", "38.570871"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 48м",
        balloonContentBody:
          'Ногинский р-он, Богослово, д. 18 "А" <br> Глубина: 48 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Богослово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "48м",
      },
    },
    {
      id: 81,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.858261", "38.567566"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 72м",
        balloonContentBody:
          'Богородский г.о., массив Богословский <br> Глубина: 72 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Богословский" data-id="#consultationForm2">Заказать</button>',
        iconContent: "72м",
      },
    },
    {
      id: 82,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.891489", "38.503268"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 30м",
        balloonContentBody:
          'Ногинский р-он, снт "Восход" <br> Глубина: 30 м <br><button class="open-modal ya-btn-marker open-modal" data-form="снт Восход" data-id="#consultationForm2">Заказать</button>',
        iconContent: "30м",
      },
    },
    {
      id: 83,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.656428", "38.170204"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 20м",
        balloonContentBody:
          'Сергиев-Посадский рн. Переславичи <br> Глубина: 20 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Переславичи" data-id="#consultationForm2">Заказать</button>',
        iconContent: "20м",
      },
    },
    {
      id: 84,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.551546", "38.194731"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 53м",
        balloonContentBody:
          'Сергиево-Посадский район, Трехселище <br> Глубина: 53 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Трехселище" data-id="#consultationForm2">Заказать</button>',
        iconContent: "53м",
      },
    },
    {
      id: 85,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.453814", "37.961031"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 73м",
        balloonContentBody:
          'Село Ерёмино <br> Глубина: 73 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Село Ерёмино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "73м",
      },
    },
    {
      id: 86,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.414563", "37.994712"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 48м",
        balloonContentBody:
          'Сергиево-Посадский р-он, Хомяково <br> Глубина: 48 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Хомяково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "48м",
      },
    },
    {
      id: 87,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.399364", "38.099667"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 46м",
        balloonContentBody:
          'Крапивино СНТ "Молодежный" <br> Глубина: 46 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Молодежный" data-id="#consultationForm2">Заказать</button>',
        iconContent: "46м",
      },
    },
    {
      id: 88,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.380129", "38.088541"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 51м",
        balloonContentBody:
          'Деревня Васильково <br> Глубина: 51 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Деревня Васильково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "51м",
      },
    },
    {
      id: 89,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.398874", "37.751116"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 42м",
        balloonContentBody:
          'Плетенево <br> Глубина: 42 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Плетенево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "42м",
      },
    },
    {
      id: 90,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.438352", "37.780280"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 46м",
        balloonContentBody:
          'Бешенково СНТ "Художник" <br> Глубина: 46 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Художник" data-id="#consultationForm2">Заказать</button>',
        iconContent: "46м",
      },
    },
    {
      id: 91,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.439256", "37.779806"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 55м",
        balloonContentBody:
          'Деревня Бешенково <br> Глубина: 55 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Деревня Бешенково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "55м",
      },
    },
    {
      id: 92,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.439480", "37.779312"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 95м",
        balloonContentBody:
          'Бешенково <br> Глубина: 95 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Бешенково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "95м",
      },
    },
    {
      id: 93,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.438990", "37.780554"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 113м",
        balloonContentBody:
          'Дмитровский рн., Бешенково, д.18 <br> Глубина: 113 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Бешенково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "113м",
      },
    },
    {
      id: 94,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.438427", "37.784887"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 51м",
        balloonContentBody:
          'Дмитровский р-он, Бешенково <br> Глубина: 51 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Бешенково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "51м",
      },
    },
    {
      id: 95,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.438532", "37.778119"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 53м",
        balloonContentBody:
          'Дмитровский р-он, Бешенково, д. 10 <br> Глубина: 53 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Бешенково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "53м",
      },
    },
    {
      id: 96,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.438326", "37.778223"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 53м",
        balloonContentBody:
          'Дмитровский р-он, Бешенково, д. 10 <br> Глубина: 53 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Бешенково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "53м",
      },
    },
    {
      id: 97,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.504516", "37.718157"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 118м",
        balloonContentBody:
          'СТ "Жаворонок", уч. 8 <br> Глубина: 118 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СТ Жаворонок" data-id="#consultationForm2">Заказать</button>',
        iconContent: "118м",
      },
    },
    {
      id: 98,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.511828", "37.639878"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 101м",
        balloonContentBody:
          'Талдомский р-он, СНТ "Лель", участок 58 <br> Глубина: 101 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Лель" data-id="#consultationForm2">Заказать</button>',
        iconContent: "101м",
      },
    },
    {
      id: 99,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.522470", "37.798439"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Дмитровский р-он, Слободищево, ул.Озерная <br> Глубина: 50 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Слободищево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 100,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.434252", "37.522773"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 93м",
        balloonContentBody:
          'Орудьево <br> Глубина: 93 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Орудьево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "93м",
      },
    },
    {
      id: 101,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.469040", "37.495060"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 31м",
        balloonContentBody:
          'Деревня Княжево, ул. Советская д. 26 А <br> Глубина: 31 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Деревня Княжево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "31м",
      },
    },
    {
      id: 102,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.463824", "37.450863"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 13м",
        balloonContentBody:
          'Деревня Дядьково <br> Глубина: 13 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Дядьково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "13м",
      },
    },
    {
      id: 103,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.473382", "37.432588"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 21м",
        balloonContentBody:
          'Деревня Надеждино <br> Глубина: 21 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Деревня Надеждино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "21м",
      },
    },
    {
      id: 104,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.452996", "37.393263"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 100м",
        balloonContentBody:
          'Деревня Петраково, д. 37 <br> Глубина: 100 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Петраково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "100м",
      },
    },
    {
      id: 105,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.419727", "37.439715"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 148м",
        balloonContentBody:
          'Дмитровский р-он, Пчелка <br> Глубина: 148 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Пчелка" data-id="#consultationForm2">Заказать</button>',
        iconContent: "148м",
      },
    },
    {
      id: 106,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.423486", "37.443461"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 97м",
        balloonContentBody:
          'Дмитровский район, поселок Татищево <br> Глубина: 97 м <br><button class="open-modal ya-btn-marker open-modal" data-form="поселок Татищево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "97м",
      },
    },
    {
      id: 107,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.373689", "37.458786"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 19м",
        balloonContentBody:
          'Кончинино, Дмитровский рн. <br> Глубина: 19 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Кончинино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "19м",
      },
    },
    {
      id: 108,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.379304", "37.409109"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 144м",
        balloonContentBody:
          'Дмитровский р-н, д. Горшково, КП Дмитроград, уч. 67 <br> Глубина: 144 м <br><button class="open-modal ya-btn-marker open-modal" data-form="КП Дмитроград" data-id="#consultationForm2">Заказать</button>',
        iconContent: "144м",
      },
    },
    {
      id: 109,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.358302", "37.446569"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 135м",
        balloonContentBody:
          'Дмитровский р-он, Муравьево, д.82 <br> Глубина: 135 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Муравьево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "135м",
      },
    },
    {
      id: 110,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.342584", "37.409598"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 190м",
        balloonContentBody:
          'КП Маринино-2 <br> Глубина: 190 м <br><button class="open-modal ya-btn-marker open-modal" data-form="КП Маринино-2" data-id="#consultationForm2">Заказать</button>',
        iconContent: "190м",
      },
    },
    {
      id: 111,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.373888", "37.304526"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 134м",
        balloonContentBody:
          'Дмитровский р-он, Новосиньковское посел., д. Арбузово <br> Глубина: 134 м <br><button class="open-modal ya-btn-marker open-modal" data-form="д. Арбузово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "134м",
      },
    },
    {
      id: 112,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.361758", "37.289858"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 45м",
        balloonContentBody:
          'Дмитровский р-он, Нестерово <br> Глубина: 45 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Нестерово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "45м",
      },
    },
    {
      id: 113,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.361952", "37.290487"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 45м",
        balloonContentBody:
          'Дмитровский р-он, Нестерово <br> Глубина: 45 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Нестерово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "45м",
      },
    },
    {
      id: 114,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.305654", "37.452130"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 170м",
        balloonContentBody:
          'Квартал Андреевское <br> Глубина: 170 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Квартал Андреевское" data-id="#consultationForm2">Заказать</button>',
        iconContent: "170м",
      },
    },
    {
      id: 115,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.304472", "37.424013"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 158м",
        balloonContentBody:
          'Деревня Астрецово <br> Глубина: 158 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Астрецово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "158м",
      },
    },
    {
      id: 116,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.301817", "37.432910"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 170м",
        balloonContentBody:
          'Дмитровский р-он, Яковлево <br> Глубина: 170 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Яковлево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "170м",
      },
    },
    {
      id: 117,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.256709", "37.325206"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 163м",
        balloonContentBody:
          'СНТ Гончарово <br> Глубина: 163 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Гончарово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "163м",
      },
    },
    {
      id: 118,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.249424", "37.349191"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 134м",
        balloonContentBody:
          'Коттеджный посёлок Речная Долина <br> Глубина: 134 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Речная Долина" data-id="#consultationForm2">Заказать</button>',
        iconContent: "134м",
      },
    },
    {
      id: 119,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.245392", "37.347003"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 51м",
        balloonContentBody:
          'Деревня Борносово <br> Глубина: 51 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Борносово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "51м",
      },
    },
    {
      id: 120,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.246092", "37.345590"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 30м",
        balloonContentBody:
          'Дмитровский р-он, д. Борносово <br> Глубина: 30 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Борносово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "30м",
      },
    },
    {
      id: 121,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.245724", "37.345590"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 30м",
        balloonContentBody:
          'Дмитровский р-он, д. Борносово, Дмитровский Г.О. <br> Глубина: 30 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Борносово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "30м",
      },
    },
    {
      id: 122,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.210087", "37.354553"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 73м",
        balloonContentBody:
          'Дмитровский район, д. Сокольники <br> Глубина: 73 м <br><button class="open-modal ya-btn-marker open-modal" data-form="д. Сокольники" data-id="#consultationForm2">Заказать</button>',
        iconContent: "73м",
      },
    },
    {
      id: 123,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.209081", "37.355883"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 160м",
        balloonContentBody:
          'Дмитровский р-он, Сокольники, ул.Главная <br> Глубина: 160 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Сокольники" data-id="#consultationForm2">Заказать</button>',
        iconContent: "160м",
      },
    },
    {
      id: 124,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.207595", "37.354577"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 162м",
        balloonContentBody:
          'Дмитровский р-он, д. Сокольники <br> Глубина: 162 м <br><button class="open-modal ya-btn-marker open-modal" data-form="д. Сокольники" data-id="#consultationForm2">Заказать</button>',
        iconContent: "162м",
      },
    },
    {
      id: 125,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.184435", "37.335807"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 163м",
        balloonContentBody:
          'Деревня Походкино, уч. 419 <br> Глубина: 163 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Походкино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "163м",
      },
    },
    {
      id: 126,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.199211", "37.477318"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 63м",
        balloonContentBody:
          'Варварино, СНТ Автомобилист <br> Глубина: 63 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Автомобилист" data-id="#consultationForm2">Заказать</button>',
        iconContent: "63м",
      },
    },
    {
      id: 127,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.186159", "37.530337"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 120м",
        balloonContentBody:
          'Деревня Игнатово, СНТ Плес, уч.34 <br> Глубина: 120 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Плес" data-id="#consultationForm2">Заказать</button>',
        iconContent: "120м",
      },
    },
    {
      id: 128,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.183579", "37.538045"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 25м",
        balloonContentBody:
          'Дмитровский р-он, Игнатово, снт"Станкин-2" <br> Глубина: 25 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Игнатово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "25м",
      },
    },
    {
      id: 129,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.177093", "37.537694"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 54м",
        balloonContentBody:
          'Игнатово, СНТ "Станкин", уч. 66 <br> Глубина: 54 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Станкин" data-id="#consultationForm2">Заказать</button>',
        iconContent: "54м",
      },
    },
    {
      id: 130,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.152883", "37.515850"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 131м",
        balloonContentBody:
          'СНТ КиМ <br> Глубина: 131 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ КиМ" data-id="#consultationForm2">Заказать</button>',
        iconContent: "131м",
      },
    },
    {
      id: 131,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.136502", "37.561663"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 136м",
        balloonContentBody:
          'Мытищинский р-он, Большое Ивановское <br> Глубина: 136 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Большое Ивановское" data-id="#consultationForm2">Заказать</button>',
        iconContent: "136м",
      },
    },
    {
      id: 132,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.134471", "37.597543"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 150м",
        balloonContentBody:
          'Мытищинский р-он, Протасово <br> Глубина: 150 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Протасово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "150м",
      },
    },
    {
      id: 133,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.132283", "37.600542"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 140м",
        balloonContentBody:
          'Мытищинский р-он, Протасово, ул. Камышовая <br> Глубина: 140 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Протасово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "140м",
      },
    },
    {
      id: 134,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.129061", "37.525597"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 150м",
        balloonContentBody:
          'Мытищинский р-н, Большая Черная <br> Глубина: 150 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Большая Черная" data-id="#consultationForm2">Заказать</button>',
        iconContent: "150м",
      },
    },
    {
      id: 135,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.128106", "37.514628"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 157м",
        balloonContentBody:
          'Трудовая Северная <br> Глубина: 157 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Трудовая Северная" data-id="#consultationForm2">Заказать</button>',
        iconContent: "157м",
      },
    },
    {
      id: 136,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.123098", "37.546967"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 152м",
        balloonContentBody:
          'Мытищинский р-он, Хлябово, ул. Снежная <br> Глубина: 152 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Хлябово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "152м",
      },
    },
    {
      id: 137,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.123297", "37.551168"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 143м",
        balloonContentBody:
          'Мытищинский район, Хлябово <br> Глубина: 143 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Хлябово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "143м",
      },
    },
    {
      id: 138,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.105294", "37.527766"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 119м",
        balloonContentBody:
          'Мытищинский р-он, Ларево, ул. Огородная <br> Глубина: 119 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Ларево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "119м",
      },
    },
    {
      id: 139,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.092280", "37.514140"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 108м",
        balloonContentBody:
          'Мытищинский рн. с.п. Федоскинское, СНТ "Островок" <br> Глубина: 108 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Островок" data-id="#consultationForm2">Заказать</button>',
        iconContent: "108м",
      },
    },
    {
      id: 140,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.082996", "37.512396"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 25м",
        balloonContentBody:
          'Мытищинский р-н, д. Сухарево <br> Глубина: 25 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Сухарево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "25м",
      },
    },
    {
      id: 141,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.081013", "37.514119"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 24м",
        balloonContentBody:
          'Мытищинский р-н, д. Сухарево, ул. Окружная <br> Глубина: 24 м <br><button class="open-modal ya-btn-marker open-modal" data-form="д. Сухарево, ул. Окружная" data-id="#consultationForm2">Заказать</button>',
        iconContent: "24м",
      },
    },
    {
      id: 142,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.079098", "37.544707"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 150м",
        balloonContentBody:
          'Мытищинский рн., Марфино, ДО "Строитель" <br> Глубина: 150 м <br><button class="open-modal ya-btn-marker open-modal" data-form="ДО Строитель" data-id="#consultationForm2">Заказать</button>',
        iconContent: "150м",
      },
    },
    {
      id: 143,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.073810", "37.548528"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 83м",
        balloonContentBody:
          'Марфино, ул. Ильинская, д. 41 <br> Глубина: 83 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Марфино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "83м",
      },
    },
    {
      id: 144,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.074118", "37.556727"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 115м",
        balloonContentBody:
          'Одинцовский район, Марфино <br> Глубина: 115 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Марфино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "115м",
      },
    },
    {
      id: 145,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.074960", "37.549114"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 19м",
        balloonContentBody:
          'Село Марфино <br> Глубина: 19 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Село Марфино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "19м",
      },
    },
    {
      id: 146,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.074215", "37.558485"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 38м",
        balloonContentBody:
          'Марфино <br> Глубина: 38 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Марфино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "38м",
      },
    },
    {
      id: 147,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.073735", "37.557807"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 86м",
        balloonContentBody:
          'Ильинская улица <br> Глубина: 86 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Ильинская улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "86м",
      },
    },
    {
      id: 148,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.073002", "37.557492"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 82м",
        balloonContentBody:
          'Село Марфино, ул. Ильинская <br> Глубина: 82 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Село Марфино, ул. Ильинская" data-id="#consultationForm2">Заказать</button>',
        iconContent: "82м",
      },
    },
    {
      id: 149,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.077020", "37.560049"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 43м",
        balloonContentBody:
          'Рождественская улица <br> Глубина: 43 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Рождественская улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "43м",
      },
    },
    {
      id: 150,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.077753", "37.591267"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 87м",
        balloonContentBody:
          'Мытищинский р-он, Малое Ивановское <br> Глубина: 87 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Малое Ивановское" data-id="#consultationForm2">Заказать</button>',
        iconContent: "87м",
      },
    },
    {
      id: 151,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.080653", "37.593797"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 84м",
        balloonContentBody:
          'Мытищинский р-он, Малое Ивановское (Марфино) <br> Глубина: 84 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Малое Ивановское (Марфино)" data-id="#consultationForm2">Заказать</button>',
        iconContent: "84м",
      },
    },
    {
      id: 152,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.079186", "37.595841"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 36м",
        balloonContentBody:
          'Мытищинский р-он, Малое Ивановское <br> Глубина: 36 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Малое Ивановское" data-id="#consultationForm2">Заказать</button>',
        iconContent: "36м",
      },
    },
    {
      id: 153,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.070035", "37.504769"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 125м",
        balloonContentBody:
          'СНТ Троице-Сельце <br> Глубина: 125 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Троице-Сельце" data-id="#consultationForm2">Заказать</button>',
        iconContent: "125м",
      },
    },
    {
      id: 154,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.056480", "37.499385"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 89м",
        balloonContentBody:
          'Деревня Троице-Сельцо <br> Глубина: 89 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Деревня Троице-Сельцо" data-id="#consultationForm2">Заказать</button>',
        iconContent: "89м",
      },
    },
    {
      id: 155,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.026665", "37.485669"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 110.85м",
        balloonContentBody:
          'Лобня <br> Глубина: 110.85 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Лобня" data-id="#consultationForm2">Заказать</button>',
        iconContent: "110.85м",
      },
    },
    {
      id: 156,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.999488", "37.495097"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 54м",
        balloonContentBody:
          'Ступинский р-он, Сумароково <br> Глубина: 54 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Сумароково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "54м",
      },
    },
    {
      id: 157,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.993489", "37.484877"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 105м",
        balloonContentBody:
          'Улица 1-я Дачная <br> Глубина: 105 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Улица 1-я Дачная" data-id="#consultationForm2">Заказать</button>',
        iconContent: "105м",
      },
    },
    {
      id: 158,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.984632", "37.521686"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'ДНТ Природа <br> Глубина: 90 м <br><button class="open-modal ya-btn-marker open-modal" data-form="ДНТ Природа" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 159,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.981565", "37.515524"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 77м",
        balloonContentBody:
          'СНТ "Мичуринец - 3", уч. 146А. <br> Глубина: 77 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Мичуринец" data-id="#consultationForm2">Заказать</button>',
        iconContent: "77м",
      },
    },
    {
      id: 160,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.975070", "37.482661"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 86м",
        balloonContentBody:
          'Мытищинский Район, Долгопрудный <br> Глубина: 86 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Долгопрудный" data-id="#consultationForm2">Заказать</button>',
        iconContent: "86м",
      },
    },
    {
      id: 161,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.972741", "37.460916"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 81м",
        balloonContentBody:
          'Долгопрудный <br> Глубина: 81 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Долгопрудный" data-id="#consultationForm2">Заказать</button>',
        iconContent: "81м",
      },
    },
    {
      id: 162,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.972605", "37.463497"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 89м",
        balloonContentBody:
          'Новое шоссе, 54 <br> Глубина: 89 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Новое шоссе" data-id="#consultationForm2">Заказать</button>',
        iconContent: "89м",
      },
    },
    {
      id: 163,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.969895", "37.474708"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'г. Химки <br> Глубина: 90 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Химки" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 164,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.968440", "37.480950"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 27м",
        balloonContentBody:
          'Долгопрудный, МКР Павельцево, д. 9"А" <br> Глубина: 27 м <br><button class="open-modal ya-btn-marker open-modal" data-form="МКР Павельцево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "27м",
      },
    },
    {
      id: 165,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.966923", "37.486657"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 82м",
        balloonContentBody:
          'Микрорайон Павельцево <br> Глубина: 82 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Микрорайон Павельцево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "82м",
      },
    },
    {
      id: 166,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.960679", "37.482708"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 65м",
        balloonContentBody:
          'Химкинский р-он, СНТ "Ивакино-1" <br> Глубина: 65 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Ивакино-1" data-id="#consultationForm2">Заказать</button>',
        iconContent: "65м",
      },
    },
    {
      id: 167,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.963102", "37.493073"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 74м",
        balloonContentBody:
          'Долгопрудный, мкр Павельцево, ул.Зеленая, д.14 <br> Глубина: 74 м <br><button class="open-modal ya-btn-marker open-modal" data-form="мкр Павельцево, ул.Зеленая" data-id="#consultationForm2">Заказать</button>',
        iconContent: "74м",
      },
    },
    {
      id: 168,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.963809", "37.498379"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 66м",
        balloonContentBody:
          'Долгопрудный, мкр "Павельцево", СНТ "Клязьма", участок 76 <br> Глубина: 66 м <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Клязьма" data-id="#consultationForm2">Заказать</button>',
        iconContent: "66м",
      },
    },
    {
      id: 169,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.955895", "37.533912"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 85м",
        balloonContentBody:
          'Мытищенский район, Грибки <br> Глубина: 85 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Грибки" data-id="#consultationForm2">Заказать</button>',
        iconContent: "85м",
      },
    },
    {
      id: 170,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.962767", "37.564280"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 97м",
        balloonContentBody:
          'Лесной переулок <br> Глубина: 97 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Лесной переулок" data-id="#consultationForm2">Заказать</button>',
        iconContent: "97м",
      },
    },
    {
      id: 171,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.959968", "37.590689"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 106м",
        balloonContentBody:
          'Мытищинский р-он, Афанасово, ул. Невская <br> Глубина: 106 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Афанасово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "106м",
      },
    },
    {
      id: 172,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.941571", "37.612659"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 96м",
        balloonContentBody:
          'ТСН Вёшки, 162 <br> Глубина: 96 м <br><button class="open-modal ya-btn-marker open-modal" data-form="ТСН Вёшки" data-id="#consultationForm2">Заказать</button>',
        iconContent: "96м",
      },
    },
    {
      id: 173,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.931321", "37.626351"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 91м",
        balloonContentBody:
          'Рябиновый переулок, 7 <br> Глубина: 91 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Рябиновый переулок, 7" data-id="#consultationForm2">Заказать</button>',
        iconContent: "91м",
      },
    },
    {
      id: 174,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.931309", "37.626807"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 84м",
        balloonContentBody:
          'Рябиновый переулок <br> Глубина: 84 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Рябиновый переулок" data-id="#consultationForm2">Заказать</button>',
        iconContent: "84м",
      },
    },
    {
      id: 175,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.928005", "37.617076"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 104м",
        balloonContentBody:
          'П. Вешки, ул. Центральная <br> Глубина: 104 м <br><button class="open-modal ya-btn-marker open-modal" data-form="П. Вешки" data-id="#consultationForm2">Заказать</button>',
        iconContent: "104м",
      },
    },
    {
      id: 176,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.927934", "37.616809"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 100м",
        balloonContentBody:
          'П. Вешки, ул. Центральная <br> Глубина: 10 м <br><button class="open-modal ya-btn-marker open-modal" data-form="П. Вешки" data-id="#consultationForm2">Заказать</button>',
        iconContent: "100м",
      },
    },
    {
      id: 177,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.923613", "37.615770"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 80м",
        balloonContentBody:
          'Северная улица, 1А <br> Глубина: 80 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Северная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "80м",
      },
    },
    {
      id: 178,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.926286", "37.658626"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 82м",
        balloonContentBody:
          'Бородино <br> Глубина: 82 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Бородино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "82м",
      },
    },
    {
      id: 179,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.921031", "37.671759"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 18м",
        balloonContentBody:
          'Мытищинский р-он, Сгонники, участок 54 <br> Глубина: 18 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Сгонники" data-id="#consultationForm2">Заказать</button>',
        iconContent: "18м",
      },
    },
    {
      id: 180,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.904564", "37.672936"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'Челобитьево <br> Глубина: 90 м <br><button class="open-modal ya-btn-marker open-modal" data-form="Челобитьево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 181,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.897983", "37.700032"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 60м",
        balloonContentBody:
          'Адрес: <b>Мытищи, Красный посёлок, д. 21 А</b> <br> Глубина: <b>60 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Красный посёлок" data-id="#consultationForm2">Заказать</button>',
        iconContent: "60м",
      },
    },
    {
      id: 182,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.952192", "37.780334"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 68м",
        balloonContentBody:
          'Адрес: <b>Коттеджный посёлок Сосны</b> <br> Глубина: <b>68 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Коттеджный посёлок Сосны" data-id="#consultationForm2">Заказать</button>',
        iconContent: "68м",
      },
    },
    {
      id: 183,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.921370", "37.913971"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 63м",
        balloonContentBody:
          'Адрес: <b>п. Загорянский, ул. Урицкого, д. 1</b> <br> Глубина: <b>63 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="п. Загорянский" data-id="#consultationForm2">Заказать</button>',
        iconContent: "63м",
      },
    },
    {
      id: 184,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.918449", "37.939645"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>улица Некрасова, 23</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="улица Некрасова" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 185,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.898586", "37.910707"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 71м",
        balloonContentBody:
          'Адрес: <b>4-й Лесной проезд</b> <br> Глубина: <b>71 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="4-й Лесной проезд" data-id="#consultationForm2">Заказать</button>',
        iconContent: "71м",
      },
    },
    {
      id: 186,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.120342", "38.141578"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 74м",
        balloonContentBody:
          'Адрес: <b>Красноармейск</b> <br> Глубина: <b>74 м</b> <br> Статус: <b>Песчаная скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Красноармейск" data-id="#consultationForm2">Заказать</button>',
        iconContent: "74м",
      },
    },
    {
      id: 187,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.085988", "38.109114"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 17м",
        balloonContentBody:
          'Адрес: <b>Пушкинский район, д. Лепёшки, д. 74а</b> <br> Глубина: <b>17 м</b> <br> Статус: <b>Песчаная скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="д. Лепёшки" data-id="#consultationForm2">Заказать</button>',
        iconContent: "17м",
      },
    },
    {
      id: 188,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.094455", "38.227178"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 73м",
        balloonContentBody:
          'Адрес: <b>Село Петровское, д.18</b> <br> Глубина: <b>73 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Село Петровское" data-id="#consultationForm2">Заказать</button>',
        iconContent: "73м",
      },
    },
    {
      id: 189,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.085363", "38.228591"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 93м",
        balloonContentBody:
          'Адрес: <b>Село Петровское</b> <br> Глубина: <b>93 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Село Петровское" data-id="#consultationForm2">Заказать</button>',
        iconContent: "93м",
      },
    },
    {
      id: 190,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.064550", "38.259437"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 14м",
        balloonContentBody:
          'Адрес: <b>Щелковский район, Огуднево</b> <br> Глубина: <b>14 м</b> <br> Статус: <b>Песчаная скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Огуднево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "14м",
      },
    },
    {
      id: 191,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.058181", "38.303017"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 82м",
        balloonContentBody:
          'Адрес: <b>Щелковский р-он, село Душоново</b> <br> Глубина: <b>82 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="село Душоново" data-id="#consultationForm2">Заказать</button>',
        iconContent: "82м",
      },
    },
    {
      id: 192,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.028315", "38.276220"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 62м",
        balloonContentBody:
          'Адрес: <b>Cело Ивановское</b> <br> Глубина: <b>62 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Cело Ивановское" data-id="#consultationForm2">Заказать</button>',
        iconContent: "62м",
      },
    },
    {
      id: 193,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["56.028662", "38.277007"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 62м",
        balloonContentBody:
          'Адрес: <b>Cело Ивановское, территория КСК "Ивановское"</b> <br> Глубина: <b>62 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="КСК Ивановское" data-id="#consultationForm2">Заказать</button>',
        iconContent: "62м",
      },
    },
    {
      id: 194,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.991074", "38.263824"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 52м",
        balloonContentBody:
          'Адрес: <b>Боково</b> <br> Глубина: <b>52 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Боково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "52м",
      },
    },
    {
      id: 195,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.915392", "38.138245"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 29м",
        balloonContentBody:
          'Адрес: <b>СНТ Здоровье-3, 19</b> <br> Глубина: <b>29 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Здоровье-3" data-id="#consultationForm2">Заказать</button>',
        iconContent: "29м",
      },
    },
    {
      id: 196,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.900062", "38.187309"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 43м",
        balloonContentBody:
          'Адрес: <b>Щелковский р-н, деревня Митянино</b> <br> Глубина: <b>43 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Митянино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "43м",
      },
    },
    {
      id: 197,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.883107", "38.183698"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 43м",
        balloonContentBody:
          'Адрес: <b>Северная улица</b> <br> Глубина: <b>43 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Северная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "43м",
      },
    },
    {
      id: 198,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.873090", "38.182663"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 38м",
        balloonContentBody:
          'Адрес: <b>Территория Аграрная</b> <br> Глубина: <b>38 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Территория Аграрная" data-id="#consultationForm2">Заказать</button>',
        iconContent: "38м",
      },
    },
    {
      id: 199,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.837828", "37.960611"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 76м",
        balloonContentBody:
          'Адрес: <b>Ул. Никольская</b> <br> Глубина: <b>76 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Ул. Никольская" data-id="#consultationForm2">Заказать</button>',
        iconContent: "76м",
      },
    },
    {
      id: 200,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.837828", "37.960611"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 76м",
        balloonContentBody:
          'Адрес: <b>Ул. Никольская</b> <br> Глубина: <b>76 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Ул. Никольская" data-id="#consultationForm2">Заказать</button>',
        iconContent: "76м",
      },
    },
    {
      id: 201,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.763994", "37.947254"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 66м",
        balloonContentBody:
          'Адрес: <b>Коллективная улица, 22</b> <br> Глубина: <b>66 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Коллективная улица, 22" data-id="#consultationForm2">Заказать</button>',
        iconContent: "66м",
      },
    },
    {
      id: 202,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.762391", "37.952092"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 59м",
        balloonContentBody:
          'Адрес: <b>Вита Парк, ул. Коллективная</b> <br> Глубина: <b>59 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Вита Парк, ул. Коллективная" data-id="#consultationForm2">Заказать</button>',
        iconContent: "59м",
      },
    },
    {
      id: 203,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.762179", "37.921311"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 59м",
        balloonContentBody:
          'Адрес: <b>ул. Западный проезд</b> <br> Глубина: <b>59 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="ул. Западный проезд" data-id="#consultationForm2">Заказать</button>',
        iconContent: "59м",
      },
    },
    {
      id: 204,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.767420", "37.866918"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 65м",
        balloonContentBody:
          'Адрес: <b>Реутов</b> <br> Глубина: <b>65 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Реутов" data-id="#consultationForm2">Заказать</button>',
        iconContent: "65м",
      },
    },
    {
      id: 205,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.760351", "37.872846"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 77м",
        balloonContentBody:
          'Адрес: <b>улица Гагарина, 33</b> <br> Глубина: <b>77 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="улица Гагарина, 33" data-id="#consultationForm2">Заказать</button>',
        iconContent: "77м",
      },
    },
    {
      id: 206,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.681346", "37.728963"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 64м",
        balloonContentBody:
          'Адрес: <b>ул. Полбина, д. 40</b> <br> Глубина: <b>64 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="ул. Полбина, д. 40" data-id="#consultationForm2">Заказать</button>',
        iconContent: "64м",
      },
    },
    {
      id: 207,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.661691", "37.703594"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 40м",
        balloonContentBody:
          'Адрес: <b>Батюнинский пр-зд, д. 12 корп. 1</b> <br> Глубина: <b>40 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Батюнинский пр-зд, д. 12 корп. 1" data-id="#consultationForm2">Заказать</button>',
        iconContent: "40м",
      },
    },
    {
      id: 208,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.570404", "37.740081"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 114м",
        balloonContentBody:
          'Адрес: <b>микрорайон Малое Видное-2, 9А</b> <br> Глубина: <b>114 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="микрорайон Малое Видное-2, 9А" data-id="#consultationForm2">Заказать</button>',
        iconContent: "114м",
      },
    },
    {
      id: 209,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.570010", "37.744576"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 110м",
        balloonContentBody:
          'Адрес: <b>Малое Видное кп Труженник Садовая 22</b> <br> Глубина: <b>110 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Малое Видное кп Труженник Садовая 22" data-id="#consultationForm2">Заказать</button>',
        iconContent: "110м",
      },
    },
    {
      id: 210,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.572990", "37.744523"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 91м",
        balloonContentBody:
          'Адрес: <b>сельское поселение Совхоз имени Ленина</b> <br> Глубина: <b>91 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="сельское поселение Совхоз имени Ленина" data-id="#consultationForm2">Заказать</button>',
        iconContent: "91м",
      },
    },
    {
      id: 211,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.559247", "37.697444"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 82м",
        balloonContentBody:
          'Адрес: <b>деревня Тарычёво, 24</b> <br> Глубина: <b>82 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Тарычёво, 24" data-id="#consultationForm2">Заказать</button>',
        iconContent: "82м",
      },
    },
    {
      id: 212,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.560456", "37.696591"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 78м",
        balloonContentBody:
          'Адрес: <b>деревня Тарычёво</b> <br> Глубина: <b>78 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Тарычёво" data-id="#consultationForm2">Заказать</button>',
        iconContent: "78м",
      },
    },
    {
      id: 213,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.561585", "37.694862"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 75м",
        balloonContentBody:
          'Адрес: <b>СНТ "Тарычево"</b> <br> Глубина: <b>75 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Тарычево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "75м",
      },
    },
    {
      id: 214,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.562971", "37.697109"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 98м",
        balloonContentBody:
          'Адрес: <b>Берёзовый проезд</b> <br> Глубина: <b>98 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Берёзовый проезд" data-id="#consultationForm2">Заказать</button>',
        iconContent: "98м",
      },
    },
    {
      id: 215,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.562047", "37.700172"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 75м",
        balloonContentBody:
          'Адрес: <b>Кленовая улица</b> <br> Глубина: <b>75 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Кленовая улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "75м",
      },
    },
    {
      id: 216,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.557398", "37.625156"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 75м",
        balloonContentBody:
          'Адрес: <b>деревня Жабкино</b> <br> Глубина: <b>75 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Жабкино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "75м",
      },
    },
    {
      id: 217,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.559202", "37.622994"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 21м",
        balloonContentBody:
          'Адрес: <b>СНТ Нектар, 259</b> <br> Глубина: <b>21 м</b> <br> Статус: <b>Песчаная скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Нектар, 259" data-id="#consultationForm2">Заказать</button>',
        iconContent: "21м",
      },
    },
    {
      id: 218,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.584479", "37.488128"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 22м",
        balloonContentBody:
          'Адрес: <b>СНТ Дубки, 154</b> <br> Глубина: <b>22 м</b> <br> Статус: <b>Песчаная скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Дубки, 154" data-id="#consultationForm2">Заказать</button>',
        iconContent: "22м",
      },
    },
    {
      id: 219,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.575630", "37.456886"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>хутор Лоза</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="хутор Лоза" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 220,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.576096", "37.436138"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 110м",
        balloonContentBody:
          'Адрес: <b>деревня Прокшино, 3А</b> <br> Глубина: <b>110 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Прокшино, 3А" data-id="#consultationForm2">Заказать</button>',
        iconContent: "110м",
      },
    },
    {
      id: 221,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.573459", "37.476258"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 110м",
        balloonContentBody:
          'Адрес: <b>Коммунарка-2, участок 35</b> <br> Глубина: <b>110 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Коммунарка-2, участок 35" data-id="#consultationForm2">Заказать</button>',
        iconContent: "110м",
      },
    },
    {
      id: 222,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.559520", "37.435627"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 78м",
        balloonContentBody:
          'Адрес: <b>Калужское шоссе, 94</b> <br> Глубина: <b>78 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Калужское шоссе, 94" data-id="#consultationForm2">Заказать</button>',
        iconContent: "78м",
      },
    },
    {
      id: 223,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.611984", "37.352664"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 80м",
        balloonContentBody:
          'Адрес: <b>СНТ "Маяк"</b> <br> Глубина: <b>80 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Маяк" data-id="#consultationForm2">Заказать</button>',
        iconContent: "80м",
      },
    },
    {
      id: 224,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.612186", "37.353121"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 93м",
        balloonContentBody:
          'Адрес: <b>СНТ "Маяк", участок 23</b> <br> Глубина: <b>93 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Маяк, участок 23" data-id="#consultationForm2">Заказать</button>',
        iconContent: "93м",
      },
    },
    {
      id: 225,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.629276", "37.329059"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 75м",
        balloonContentBody:
          'Адрес: <b>дер. Милюково</b> <br> Глубина: <b>75 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="дер. Милюково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "75м",
      },
    },
    {
      id: 226,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.629434", "37.333361"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 75м",
        balloonContentBody:
          'Адрес: <b>дер. Рассказовка</b> <br> Глубина: <b>75 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="дер. Рассказовка" data-id="#consultationForm2">Заказать</button>',
        iconContent: "75м",
      },
    },
    {
      id: 227,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.634522", "37.311112"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 102м",
        balloonContentBody:
          'Адрес: <b>Сказочная улица, 4</b> <br> Глубина: <b>102 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Сказочная улица, 4" data-id="#consultationForm2">Заказать</button>',
        iconContent: "102м",
      },
    },
    {
      id: 228,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.666123", "37.335396"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 123м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Стольное</b> <br> Глубина: <b>123 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Стольное" data-id="#consultationForm2">Заказать</button>',
        iconContent: "123м",
      },
    },
    {
      id: 229,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.671920", "37.340451"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 129м",
        balloonContentBody:
          'Адрес: <b>Набережная улица, 26</b> <br> Глубина: <b>129 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Набережная улица, 26" data-id="#consultationForm2">Заказать</button>',
        iconContent: "129м",
      },
    },
    {
      id: 230,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.680713", "37.344187"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 139м",
        balloonContentBody:
          'Адрес: <b>район Южный</b> <br> Глубина: <b>139 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="район Южный" data-id="#consultationForm2">Заказать</button>',
        iconContent: "139м",
      },
    },
    {
      id: 231,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.630392", "37.446329"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 29м",
        balloonContentBody:
          'Адрес: <b>СНТ Дудкино, 130</b> <br> Глубина: <b>29 м</b> <br> Статус: <b>Песчаная скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Дудкино, 130" data-id="#consultationForm2">Заказать</button>',
        iconContent: "29м",
      },
    },
    {
      id: 232,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.731241", "37.214543"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 22м",
        balloonContentBody:
          'Адрес: <b>село Усово</b> <br> Глубина: <b>22 м</b> <br> Статус: <b>Песчаная скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="село Усово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "22м",
      },
    },
    {
      id: 233,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.740246", "37.238819"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'Адрес: <b>улица Сосновый Бор</b> <br> Глубина: <b>90 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="улица Сосновый Бор" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 234,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.440802", "37.541010"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 30м",
        balloonContentBody:
          'Адрес: <b>снт Коммунальник, участок 38</b> <br> Глубина: <b>30 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="снт Коммунальник" data-id="#consultationForm2">Заказать</button>',
        iconContent: "30м",
      },
    },
    {
      id: 235,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.427053", "37.542769"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 54м",
        balloonContentBody:
          'Адрес: <b>СНТ "Красная Горка-1", участок №8</b> <br> Глубина: <b>54 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ "Красная Горка-1", участок №8" data-id="#consultationForm2">Заказать</button>',
        iconContent: "54м",
      },
    },
    {
      id: 235,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.414789", "37.559063"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 47м",
        balloonContentBody:
          'Адрес: <b>3-я улица, СНТ ЗИО № 1</b> <br> Глубина: <b>47 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="3-я улица, СНТ ЗИО № 1", участок №8" data-id="#consultationForm2">Заказать</button>',
        iconContent: "47м",
      },
    },
    {
      id: 236,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.424692", "37.481580"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>СНТ Эксплуатационник</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Эксплуатационник", участок №8" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 237,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.436218", "37.452723"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 60м",
        balloonContentBody:
          'Адрес: <b>Кутьино, ул. Садовая, д. 3</b> <br> Глубина: <b>60 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Кутьино, ул. Садовая, д. 3", участок №8" data-id="#consultationForm2">Заказать</button>',
        iconContent: "60м",
      },
    },
    {
      id: 238,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.449849", "37.513699"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 60м",
        balloonContentBody:
          'Адрес: <b>СНТ Десна, 263</b> <br> Глубина: <b>60 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Десна, 263", участок №8" data-id="#consultationForm2">Заказать</button>',
        iconContent: "60м",
      },
    },
    {
      id: 239,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.450205", "37.514077"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 70м",
        balloonContentBody:
          'Адрес: <b>СНТ Десна, 249</b> <br> Глубина: <b>70 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Десна, 249", участок №8" data-id="#consultationForm2">Заказать</button>',
        iconContent: "70м",
      },
    },
    {
      id: 240,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.450531", "37.509583"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 85м",
        balloonContentBody:
          'Адрес: <b>СНТ Десна, 267А</b> <br> Глубина: <b>85 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Десна, 267А", участок №8" data-id="#consultationForm2">Заказать</button>',
        iconContent: "85м",
      },
    },
    {
      id: 241,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.451196", "37.510969"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 66м",
        balloonContentBody:
          'Адрес: <b>квартал № 150, 242</b> <br> Глубина: <b>66 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="квартал № 150, 242", участок №8" data-id="#consultationForm2">Заказать</button>',
        iconContent: "66м",
      },
    },
    {
      id: 242,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.458854", "37.508670"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 57м",
        balloonContentBody:
          'Адрес: <b>Ерино</b> <br> Глубина: <b>57 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Ерино", участок №8" data-id="#consultationForm2">Заказать</button>',
        iconContent: "57м",
      },
    },
    {
      id: 243,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.459492", "37.549433"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 53м",
        balloonContentBody:
          'Адрес: <b>СНТ "Воговец", ул. Огородная</b> <br> Глубина: <b>53 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ "Воговец", ул. Огородная", участок №8" data-id="#consultationForm2">Заказать</button>',
        iconContent: "53м",
      },
    },
    {
      id: 244,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.460626", "37.550585"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>СНТ "Воговец", проезд Авиаторов, 256</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ "Воговец", проезд Авиаторов, 256" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 245,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.460961", "37.550144"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 60м",
        balloonContentBody:
          'Адрес: <b>СНТ Воговец</b> <br> Глубина: <b>60 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Воговец" data-id="#consultationForm2">Заказать</button>',
        iconContent: "60м",
      },
    },
    {
      id: 246,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.480548", "37.504506"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 72м",
        balloonContentBody:
          'Адрес: <b>снт Ерино, 2-я Садовая</b> <br> Глубина: <b>72 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="снт Ерино, 2-я Садовая" data-id="#consultationForm2">Заказать</button>',
        iconContent: "72м",
      },
    },
    {
      id: 247,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.486711", "37.501835"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 37м",
        balloonContentBody:
          'Адрес: <b>СНТ Надежда, 31</b> <br> Глубина: <b>37 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Надежда, 31" data-id="#consultationForm2">Заказать</button>',
        iconContent: "37м",
      },
    },
    {
      id: 248,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.487458", "37.502624"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 45м",
        balloonContentBody:
          'Адрес: <b>СНТ Надежда, 10</b> <br> Глубина: <b>45 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Надежда, 10" data-id="#consultationForm2">Заказать</button>',
        iconContent: "45м",
      },
    },
    {
      id: 249,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.484717", "37.470667"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 56м",
        balloonContentBody:
          'Адрес: <b>деревня Мостовское, 36</b> <br> Глубина: <b>56 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Мостовское, 36" data-id="#consultationForm2">Заказать</button>',
        iconContent: "56м",
      },
    },
    {
      id: 250,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.494908", "37.480206"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 40м",
        balloonContentBody:
          'Адрес: <b>СНТ "Прометей", участок 205</b> <br> Глубина: <b>40 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ "Прометей", участок 205" data-id="#consultationForm2">Заказать</button>',
        iconContent: "40м",
      },
    },
    {
      id: 251,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.498838", "37.473076"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 75м",
        balloonContentBody:
          'Адрес: <b>поселение Рязановское, Москва</b> <br> Глубина: <b>75 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="поселение Рязановское, Москва", участок 205" data-id="#consultationForm2">Заказать</button>',
        iconContent: "75м",
      },
    },
    {
      id: 252,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.500685", "37.476993"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 41м",
        balloonContentBody:
          'Адрес: <b>Рязановское поселение, д. Никульское</b> <br> Глубина: <b>41 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Рязановское поселение, д. Никульское", участок 205" data-id="#consultationForm2">Заказать</button>',
        iconContent: "41м",
      },
    },
    {
      id: 253,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.491093", "37.440537"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 40м",
        balloonContentBody:
          'Адрес: <b>СНТ Поиск-2, 4/3с1</b> <br> Глубина: <b>40 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Поиск-2, 4/3с1", участок 205" data-id="#consultationForm2">Заказать</button>',
        iconContent: "40м",
      },
    },
    {
      id: 254,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.490368", "37.436311"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 45м",
        balloonContentBody:
          'Адрес: <b>СНТ Поиск, 91с1</b> <br> Глубина: <b>45 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Поиск, 91с1", участок 205" data-id="#consultationForm2">Заказать</button>',
        iconContent: "45м",
      },
    },
    {
      id: 255,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.489506", "37.440218"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 45м",
        balloonContentBody:
          'Адрес: <b>СНТ Поиск, 5</b> <br> Глубина: <b>45 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Поиск, 5", участок 205" data-id="#consultationForm2">Заказать</button>',
        iconContent: "45м",
      },
    },
    {
      id: 256,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.490052", "37.430484"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>деревня Кувекино, 43</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Кувекино, 43", участок 205" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 257,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.442599", "37.376205"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 49м",
        balloonContentBody:
          'Адрес: <b>КП Подолье</b> <br> Глубина: <b>49 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="КП Подолье", участок 205" data-id="#consultationForm2">Заказать</button>',
        iconContent: "49м",
      },
    },
    {
      id: 258,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.441739", "37.377400"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 40м",
        balloonContentBody:
          'Адрес: <b>3-я Лесная улица</b> <br> Глубина: <b>40 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="3-я Лесная улица", участок 205" data-id="#consultationForm2">Заказать</button>',
        iconContent: "40м",
      },
    },
    {
      id: 259,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.440790", "37.373711"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 60м",
        balloonContentBody:
          'Адрес: <b>КП "Подолье", уч. 67</b> <br> Глубина: <b>60 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="КП "Подолье", уч. 67", участок 205" data-id="#consultationForm2">Заказать</button>',
        iconContent: "60м",
      },
    },
    {
      id: 260,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.442376", "37.373107"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 46м",
        balloonContentBody:
          'Адрес: <b>Лесная улица</b> <br> Глубина: <b>46 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Лесная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "46м",
      },
    },
    {
      id: 261,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.431410", "37.371224"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 55м",
        balloonContentBody:
          'Адрес: <b>Парадная улица</b> <br> Глубина: <b>55 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Парадная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "55м",
      },
    },
    {
      id: 262,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.434767", "37.319475"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 56м",
        balloonContentBody:
          'Адрес: <b>деревня Софьино, 74</b> <br> Глубина: <b>56 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Софьино, 74" data-id="#consultationForm2">Заказать</button>',
        iconContent: "56м",
      },
    },
    {
      id: 263,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.438443", "37.319552"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 69м",
        balloonContentBody:
          'Адрес: <b>деревня Подосинки, 19</b> <br> Глубина: <b>69 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Подосинки, 19" data-id="#consultationForm2">Заказать</button>',
        iconContent: "69м",
      },
    },
    {
      id: 264,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.487363", "37.303935"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 40м",
        balloonContentBody:
          'Адрес: <b>микрорайон В</b> <br> Глубина: <b>40 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="микрорайон В" data-id="#consultationForm2">Заказать</button>',
        iconContent: "40м",
      },
    },
    {
      id: 265,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.491392", "37.297036"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 57м",
        balloonContentBody:
          'Адрес: <b>дск "Советский писатель", Восточная аллея</b> <br> Глубина: <b>57 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="дск "Советский писатель", Восточная аллея" data-id="#consultationForm2">Заказать</button>',
        iconContent: "57м",
      },
    },
    {
      id: 266,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.490087", "37.318182"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 40м",
        balloonContentBody:
          'Адрес: <b>6-я Вишнёвая улица, 22</b> <br> Глубина: <b>40 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="6-я Вишнёвая улица, 22" data-id="#consultationForm2">Заказать</button>',
        iconContent: "40м",
      },
    },
    {
      id: 267,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.489736", "37.319341"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 37м",
        balloonContentBody:
          'Адрес: <b>СНТ Ветеран-2, 230</b> <br> Глубина: <b>37 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Ветеран-2, 230" data-id="#consultationForm2">Заказать</button>',
        iconContent: "37м",
      },
    },
    {
      id: 268,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.489716", "37.319487"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 37м",
        balloonContentBody:
          'Адрес: <b>7-я Вишнёвая улица</b> <br> Глубина: <b>37 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="7-я Вишнёвая улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "37м",
      },
    },
    {
      id: 269,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.499795", "37.306825"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 30м",
        balloonContentBody:
          'Адрес: <b>Дошкольная улица</b> <br> Глубина: <b>30 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Дошкольная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "30м",
      },
    },
    {
      id: 270,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.495587", "37.343701"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 53м",
        balloonContentBody:
          'Адрес: <b>Десеновскоет поселение, Ватутинки, снт "Искра-2"</b> <br> Глубина: <b>53 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Десеновскоет поселение, Ватутинки, снт Искра-2" data-id="#consultationForm2">Заказать</button>',
        iconContent: "53м",
      },
    },
    {
      id: 271,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.496568", "37.344590"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 53м",
        balloonContentBody:
          'Адрес: <b>п. Ватутинки, днп "Витязь", участок 8</b> <br> Глубина: <b>53 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="п. Ватутинки, днп "Витязь", участок 8" data-id="#consultationForm2">Заказать</button>',
        iconContent: "53м",
      },
    },
    {
      id: 272,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.508367", "37.290017"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 45м",
        balloonContentBody:
          'Адрес: <b>деревня Жуковка, 3</b> <br> Глубина: <b>45 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Жуковка, 3" data-id="#consultationForm2">Заказать</button>',
        iconContent: "45м",
      },
    },
    {
      id: 273,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.514548", "37.285332"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 41м",
        balloonContentBody:
          'Адрес: <b>Первомайское поселение, д. Конюшково</b> <br> Глубина: <b>41 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Первомайское поселение, д. Конюшково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "41м",
      },
    },
    {
      id: 274,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.507375", "37.380652"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 55м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Витязь</b> <br> Глубина: <b>55 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Витязь" data-id="#consultationForm2">Заказать</button>',
        iconContent: "55м",
      },
    },
    {
      id: 275,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.510221", "37.426759"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>Ленинский р-он, Лаптево д.2/2</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Ленинский р-он, Лаптево д.2/2" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 276,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.434802", "37.319524"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 56м",
        balloonContentBody:
          'Адрес: <b>деревня Софьино, 74</b> <br> Глубина: <b>56 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Софьино, 74" data-id="#consultationForm2">Заказать</button>',
        iconContent: "56м",
      },
    },
    {
      id: 277,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.438494", "37.319587"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 69м",
        balloonContentBody:
          'Адрес: <b>Краснопахорское поселение, Подосинки</b> <br> Глубина: <b>69 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Краснопахорское поселение, Подосинки" data-id="#consultationForm2">Заказать</button>',
        iconContent: "69м",
      },
    },
    {
      id: 278,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.424010", "37.280357"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 59м",
        balloonContentBody:
          'Адрес: <b>деревня Страдань</b> <br> Глубина: <b>59 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Страдань" data-id="#consultationForm2">Заказать</button>',
        iconContent: "59м",
      },
    },
    {
      id: 279,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.418838", "37.263660"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 65м",
        balloonContentBody:
          'Адрес: <b>Калужское шоссе, 46-й километр</b> <br> Глубина: <b>65 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Калужское шоссе, 46-й километр" data-id="#consultationForm2">Заказать</button>',
        iconContent: "65м",
      },
    },
    {
      id: 280,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.411907", "37.254739"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>Новая Москва, 47 километр Калужского шоссе</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Калужское шоссе, 46-й километр" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 281,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.410847", "37.254375"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>Калужское шоссе, 47-й километр, 4с2</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Калужское шоссе, 47-й километр, 4с2" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 282,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.404287", "37.268787"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 55м",
        balloonContentBody:
          'Адрес: <b>Краснопахорское поселение, Романцево</b> <br> Глубина: <b>55 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Краснопахорское поселение, Романцево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "55м",
      },
    },
    {
      id: 283,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.398278", "37.284495"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 49м",
        balloonContentBody:
          'Адрес: <b>СНТ Текстильщик, 69</b> <br> Глубина: <b>49 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Текстильщик, 69" data-id="#consultationForm2">Заказать</button>',
        iconContent: "49м",
      },
    },
    {
      id: 284,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.411095", "37.290385"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 67м",
        balloonContentBody:
          'Адрес: <b>СНТ Весна-МК, 114</b> <br> Глубина: <b>67 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Весна-МК, 114" data-id="#consultationForm2">Заказать</button>',
        iconContent: "67м",
      },
    },
    {
      id: 285,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.393555", "37.231222"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 46м",
        balloonContentBody:
          'Адрес: <b>Чириково</b> <br> Глубина: <b>46 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Чириково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "46м",
      },
    },
    {
      id: 286,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.405501", "37.182311"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 36м",
        balloonContentBody:
          'Адрес: <b>поселение Михайлово-Ярцевское, Шишкин лес</b> <br> Глубина: <b>36 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="поселение Михайлово-Ярцевское, Шишкин лес" data-id="#consultationForm2">Заказать</button>',
        iconContent: "36м",
      },
    },
    {
      id: 287,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.405220", "37.185420"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 32м",
        balloonContentBody:
          'Адрес: <b>деревня Исаково, 93</b> <br> Глубина: <b>32 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Исаково, 93" data-id="#consultationForm2">Заказать</button>',
        iconContent: "32м",
      },
    },
    {
      id: 288,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.410187", "37.191265"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 40м",
        balloonContentBody:
          'Адрес: <b>Подольский район, Шишкин лес</b> <br> Глубина: <b>40 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Подольский район, Шишкин лес" data-id="#consultationForm2">Заказать</button>',
        iconContent: "40м",
      },
    },
    {
      id: 289,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.436104", "37.232919"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 42м",
        balloonContentBody:
          'Адрес: <b>снт "Черемуха", уч. 88</b> <br> Глубина: <b>42 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="снт "Черемуха", уч. 88" data-id="#consultationForm2">Заказать</button>',
        iconContent: "42м",
      },
    },
    {
      id: 290,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.446903", "37.226670"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 38м",
        balloonContentBody:
          'Адрес: <b>деревня Малыгино, 24</b> <br> Глубина: <b>38 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Малыгино, 24" data-id="#consultationForm2">Заказать</button>',
        iconContent: "38м",
      },
    },
    {
      id: 291,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.458620", "37.222359"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 57м",
        balloonContentBody:
          'Адрес: <b>пос. Краснопахорское д. Поляны</b> <br> Глубина: <b>57 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="пос. Краснопахорское д. Поляны" data-id="#consultationForm2">Заказать</button>',
        iconContent: "57м",
      },
    },
    {
      id: 292,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.459813", "37.224685"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 57м",
        balloonContentBody:
          'Адрес: <b>деревня Поляны, 5</b> <br> Глубина: <b>57 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Поляны, 5" data-id="#consultationForm2">Заказать</button>',
        iconContent: "57м",
      },
    },
    {
      id: 293,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.466448", "37.221540"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 70м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Баварские Поляны</b> <br> Глубина: <b>70 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Баварские Поляны" data-id="#consultationForm2">Заказать</button>',
        iconContent: "70м",
      },
    },
    {
      id: 294,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.484786", "37.279895"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 80м",
        balloonContentBody:
          'Адрес: <b>спортивно-оздоровительная база Лесная</b> <br> Глубина: <b>80 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="спортивно-оздоровительная база Лесная" data-id="#consultationForm2">Заказать</button>',
        iconContent: "80м",
      },
    },
    {
      id: 295,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.480674", "37.272721"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 71м",
        balloonContentBody:
          'Адрес: <b>Пучково</b> <br> Глубина: <b>71 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Пучково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "71м",
      },
    },
    {
      id: 296,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.479289", "37.388909"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>ПО Яковлево уч. 5-6</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="ПО Яковлево уч. 5-6" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 297,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.481317", "37.396243"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 51м",
        balloonContentBody:
          'Адрес: <b>Яковлево</b> <br> Глубина: <b>51 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Яковлево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "51м",
      },
    },
    {
      id: 298,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.482240", "37.398111"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 55м",
        balloonContentBody:
          'Адрес: <b>Лесная улица</b> <br> Глубина: <b>55 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Лесная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "55м",
      },
    },
    {
      id: 299,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.482257", "37.392111"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 87м",
        balloonContentBody:
          'Адрес: <b>Лесная улица, 16</b> <br> Глубина: <b>87 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Лесная улица, 16" data-id="#consultationForm2">Заказать</button>',
        iconContent: "87м",
      },
    },
    {
      id: 300,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.525722", "37.368962"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 27м",
        balloonContentBody:
          'Адрес: <b>микрорайон Агропункт</b> <br> Глубина: <b>27 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="микрорайон Агропункт" data-id="#consultationForm2">Заказать</button>',
        iconContent: "27м",
      },
    },
    {
      id: 301,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.729887", "37.513502"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 66м",
        balloonContentBody:
          'Адрес: <b>район Дорогомилово</b> <br> Глубина: <b>66 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="район Дорогомилово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "66м",
      },
    },
    {
      id: 302,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.512814", "37.254399"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 42м",
        balloonContentBody:
          'Адрес: <b>д. Губцево, ул. Центральная</b> <br> Глубина: <b>42 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="д. Губцево, ул. Центральная" data-id="#consultationForm2">Заказать</button>',
        iconContent: "42м",
      },
    },
    {
      id: 303,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.514417", "37.239674"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 77м",
        balloonContentBody:
          'Адрес: <b>Садовая улица, 26А</b> <br> Глубина: <b>77 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Садовая улица, 26А" data-id="#consultationForm2">Заказать</button>',
        iconContent: "77м",
      },
    },
    {
      id: 304,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.523210", "37.224347"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 41м",
        balloonContentBody:
          'Адрес: <b>Заречная улица, 27</b> <br> Глубина: <b>41 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Заречная улица, 27" data-id="#consultationForm2">Заказать</button>',
        iconContent: "41м",
      },
    },
    {
      id: 305,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.532073", "37.239136"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 77м",
        balloonContentBody:
          'Адрес: <b>СНТ Верховье, 129</b> <br> Глубина: <b>77 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Верховье, 129" data-id="#consultationForm2">Заказать</button>',
        iconContent: "77м",
      },
    },
    {
      id: 306,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.532014", "37.238904"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 60м",
        balloonContentBody:
          'Адрес: <b>Центральная улица</b> <br> Глубина: <b>60 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Центральная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "60м",
      },
    },
    {
      id: 307,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.534168", "37.195907"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 58м",
        balloonContentBody:
          'Адрес: <b>деревня Рогозинино, 30</b> <br> Глубина: <b>58 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Рогозинино, 30" data-id="#consultationForm2">Заказать</button>',
        iconContent: "58м",
      },
    },
    {
      id: 308,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.543084", "37.213317"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 65м",
        balloonContentBody:
          'Адрес: <b>3-я линия</b> <br> Глубина: <b>65 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="3-я линия" data-id="#consultationForm2">Заказать</button>',
        iconContent: "65м",
      },
    },
    {
      id: 309,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.528608", "37.167849"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 92м",
        balloonContentBody:
          'Адрес: <b>Юго-Восточная улица, 72</b> <br> Глубина: <b>92 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Юго-Восточная улица, 72" data-id="#consultationForm2">Заказать</button>',
        iconContent: "92м",
      },
    },
    {
      id: 310,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.526122", "37.167909"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 102м",
        balloonContentBody:
          'Адрес: <b>Юго-Восточная улица, 3</b> <br> Глубина: <b>102 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Юго-Восточная улица, 3" data-id="#consultationForm2">Заказать</button>',
        iconContent: "102м",
      },
    },
    {
      id: 311,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.526451", "37.166346"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 72м",
        balloonContentBody:
          'Адрес: <b>Юго-Восточная улица</b> <br> Глубина: <b>72 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Юго-Восточная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "72м",
      },
    },
    {
      id: 312,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.524305", "37.161945"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 42м",
        balloonContentBody:
          'Адрес: <b>КП Зимний сад, уч. № 42</b> <br> Глубина: <b>42 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="КП Зимний сад, уч. № 42" data-id="#consultationForm2">Заказать</button>',
        iconContent: "42м",
      },
    },
    {
      id: 313,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.527053", "37.149625"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 31м",
        balloonContentBody:
          'Адрес: <b>д. Бараново уч.1</b> <br> Глубина: <b>31 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="д. Бараново уч.1" data-id="#consultationForm2">Заказать</button>',
        iconContent: "31м",
      },
    },
    {
      id: 314,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.525853", "37.132240"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 41м",
        balloonContentBody:
          'Адрес: <b>Монастырская улица, 11</b> <br> Глубина: <b>41 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Монастырская улица, 11" data-id="#consultationForm2">Заказать</button>',
        iconContent: "41м",
      },
    },
    {
      id: 315,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.528536", "37.130238"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 56м",
        balloonContentBody:
          'Адрес: <b>деревня Милюково, 28А</b> <br> Глубина: <b>56 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Милюково, 28А" data-id="#consultationForm2">Заказать</button>',
        iconContent: "56м",
      },
    },
    {
      id: 316,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.528514", "37.129976"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 45м",
        balloonContentBody:
          'Адрес: <b>деревня Милюково, 26</b> <br> Глубина: <b>45 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Милюково, 28" data-id="#consultationForm2">Заказать</button>',
        iconContent: "45м",
      },
    },
    {
      id: 317,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.532900", "37.128426"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>уч. 62</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="уч. 62" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 318,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.532755", "37.128394"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 30м",
        balloonContentBody:
          'Адрес: <b>Настасьино</b> <br> Глубина: <b>30 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Настасьино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "30м",
      },
    },
    {
      id: 319,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.536299", "37.127146"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 45м",
        balloonContentBody:
          'Адрес: <b>Сиреневая улица, 39</b> <br> Глубина: <b>45 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Сиреневая улица, 39" data-id="#consultationForm2">Заказать</button>',
        iconContent: "45м",
      },
    },
    {
      id: 320,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.550743", "37.141994"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 58м",
        balloonContentBody:
          'Адрес: <b>СНТ Лира, 11</b> <br> Глубина: <b>58 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Лира, 11" data-id="#consultationForm2">Заказать</button>',
        iconContent: "58м",
      },
    },
    {
      id: 321,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.558486", "37.130767"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 56м",
        balloonContentBody:
          'Адрес: <b>СНТ "Поляна", уч-к 55</b> <br> Глубина: <b>56 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ "Поляна", уч-к 55" data-id="#consultationForm2">Заказать</button>',
        iconContent: "56м",
      },
    },
    {
      id: 322,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.569342", "37.100347"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 64м",
        balloonContentBody:
          'Адрес: <b>2-я улица</b> <br> Глубина: <b>64 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="2-я улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "64м",
      },
    },
    {
      id: 323,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.596108", "37.109302"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 93м",
        balloonContentBody:
          'Адрес: <b>поселок совхоза Крекшино, ул. Вишневая, д. 40</b> <br> Глубина: <b>93 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="поселок совхоза Крекшино, ул. Вишневая, д. 40" data-id="#consultationForm2">Заказать</button>',
        iconContent: "93м",
      },
    },
    {
      id: 324,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.595862", "37.120107"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 68м",
        balloonContentBody:
          'Адрес: <b>Дорожная улица, 20Б</b> <br> Глубина: <b>68 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Дорожная улица, 20Б" data-id="#consultationForm2">Заказать</button>',
        iconContent: "68м",
      },
    },
    {
      id: 325,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.596305", "37.125839"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 68м",
        balloonContentBody:
          'Адрес: <b>Овражная улица</b> <br> Глубина: <b>68 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Овражная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "68м",
      },
    },
    {
      id: 326,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.591538", "37.167669"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 70м",
        balloonContentBody:
          'Адрес: <b>улица Горького, 1А</b> <br> Глубина: <b>70 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="улица Горького, 1А" data-id="#consultationForm2">Заказать</button>',
        iconContent: "70м",
      },
    },
    {
      id: 327,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.595801", "37.169617"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>снт "Солнечный"</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="снт Солнечный" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 328,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.598753", "37.176091"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 61м",
        balloonContentBody:
          'Адрес: <b>Первомайская улица, 4А</b> <br> Глубина: <b>61 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Первомайская улица, 4А" data-id="#consultationForm2">Заказать</button>',
        iconContent: "61м",
      },
    },
    {
      id: 329,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.593380", "37.190999"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 58м",
        balloonContentBody:
          'Адрес: <b>СНТ Марушкино-92, 50/3с1</b> <br> Глубина: <b>58 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Марушкино-92, 50/3с1" data-id="#consultationForm2">Заказать</button>',
        iconContent: "58м",
      },
    },
    {
      id: 330,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.593078", "37.206395"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 59м",
        balloonContentBody:
          'Адрес: <b>Марушкино</b> <br> Глубина: <b>59 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Марушкино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "59м",
      },
    },
    {
      id: 331,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.597695", "37.231609"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 21м",
        balloonContentBody:
          'Адрес: <b>СНТ Искра, 299</b> <br> Глубина: <b>21 м</b> <br> Статус: <b>Песчаная скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Искра, 299" data-id="#consultationForm2">Заказать</button>',
        iconContent: "21м",
      },
    },
    {
      id: 332,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.402208", "37.598286"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 73м",
        balloonContentBody:
          'Адрес: <b>Южный обход Подольска</b> <br> Глубина: <b>73 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Южный обход Подольска" data-id="#consultationForm2">Заказать</button>',
        iconContent: "73м",
      },
    },
    {
      id: 333,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.391945", "37.619507"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 64м",
        balloonContentBody:
          'Адрес: <b>деревня Поливаново</b> <br> Глубина: <b>64 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Поливаново" data-id="#consultationForm2">Заказать</button>',
        iconContent: "64м",
      },
    },
    {
      id: 334,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.393303", "37.618598"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 83м",
        balloonContentBody:
          'Адрес: <b>Домодедовский район, Поливаново</b> <br> Глубина: <b>83 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Домодедовский район, Поливаново" data-id="#consultationForm2">Заказать</button>',
        iconContent: "83м",
      },
    },
    {
      id: 335,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.379562", "37.587779"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 79м",
        balloonContentBody:
          'Адрес: <b>Северная улица</b> <br> Глубина: <b>79 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Северная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "79м",
      },
    },
    {
      id: 336,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.487808", "37.536784"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 70м",
        balloonContentBody:
          'Адрес: <b>деревня Старосырово, 36</b> <br> Глубина: <b>70 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Старосырово, 36" data-id="#consultationForm2">Заказать</button>',
        iconContent: "70м",
      },
    },
    {
      id: 336,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.504295", "37.557874"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 63м",
        balloonContentBody:
          'Адрес: <b>Индустриальная улица, 3</b> <br> Глубина: <b>63 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Индустриальная улица, 3" data-id="#consultationForm2">Заказать</button>',
        iconContent: "63м",
      },
    },
    {
      id: 337,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.509987", "37.555831"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'Адрес: <b>Бутовский тупик, 1Б</b> <br> Глубина: <b>90 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Бутовский тупик, 1Б" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 338,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.514240", "37.562449"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 97м",
        balloonContentBody:
          'Адрес: <b>Бутовский тупик, 6</b> <br> Глубина: <b>97 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Бутовский тупик, 6" data-id="#consultationForm2">Заказать</button>',
        iconContent: "97м",
      },
    },
    {
      id: 339,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.510818", "37.570533"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 79м",
        balloonContentBody:
          'Адрес: <b>Щербинка</b> <br> Глубина: <b>79 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Щербинка" data-id="#consultationForm2">Заказать</button>',
        iconContent: "79м",
      },
    },
    {
      id: 340,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.511185", "37.579704"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 81м",
        balloonContentBody:
          'Адрес: <b>деревня Щербинка, 4</b> <br> Глубина: <b>81 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Щербинка, 4" data-id="#consultationForm2">Заказать</button>',
        iconContent: "81м",
      },
    },
    {
      id: 341,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.511185", "37.579704"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 81м",
        balloonContentBody:
          'Адрес: <b>деревня Щербинка, 4</b> <br> Глубина: <b>81 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Щербинка, 4" data-id="#consultationForm2">Заказать</button>',
        iconContent: "81м",
      },
    },
    {
      id: 342,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.513299", "37.580676"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'Адрес: <b>деревня Щербинка, 18</b> <br> Глубина: <b>90 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Щербинка, 18" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 343,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.533585", "37.604829"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 72м",
        balloonContentBody:
          'Адрес: <b>СНТ Урожай</b> <br> Глубина: <b>72 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Урожай" data-id="#consultationForm2">Заказать</button>',
        iconContent: "72м",
      },
    },
    {
      id: 344,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.527002", "37.672119"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 70м",
        balloonContentBody:
          'Адрес: <b>микрорайон Дружный</b> <br> Глубина: <b>70 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="микрорайон Дружный" data-id="#consultationForm2">Заказать</button>',
        iconContent: "70м",
      },
    },
    {
      id: 345,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.522185", "37.690809"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 70м",
        balloonContentBody:
          'Адрес: <b>ТСН Архитектор-Ветеран, 11</b> <br> Глубина: <b>70 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="ТСН Архитектор-Ветеран, 11" data-id="#consultationForm2">Заказать</button>',
        iconContent: "70м",
      },
    },
    {
      id: 346,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.521208", "37.696299"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 69м",
        balloonContentBody:
          'Адрес: <b>3-я улица, 54</b> <br> Глубина: <b>69 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="3-я улица, 54" data-id="#consultationForm2">Заказать</button>',
        iconContent: "69м",
      },
    },
    {
      id: 347,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.516265", "37.695724"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 75м",
        balloonContentBody:
          'Адрес: <b>деревня Федюково</b> <br> Глубина: <b>75 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Федюково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "75м",
      },
    },
    {
      id: 348,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.515208", "37.687553"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 81м",
        balloonContentBody:
          'Адрес: <b>Подольский рн. д. Федюково</b> <br> Глубина: <b>81 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Подольский рн. д. Федюково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "81м",
      },
    },
    {
      id: 349,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.513330", "37.705214"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 57м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Солнечный берег</b> <br> Глубина: <b>57 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Солнечный берег" data-id="#consultationForm2">Заказать</button>',
        iconContent: "57м",
      },
    },
    {
      id: 350,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.500101", "37.719806"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 25м",
        balloonContentBody:
          'Адрес: <b>Южная улица</b> <br> Глубина: <b>25 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Южная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "25м",
      },
    },
    {
      id: 351,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.489830", "37.724175"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 41м",
        balloonContentBody:
          'Адрес: <b>Павловская улица, 11</b> <br> Глубина: <b>41 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Павловская улица, 11" data-id="#consultationForm2">Заказать</button>',
        iconContent: "41м",
      },
    },
    {
      id: 352,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.482486", "37.727104"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 36м",
        balloonContentBody:
          'Адрес: <b>Вокзальный проезд</b> <br> Глубина: <b>36 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Вокзальный проезд" data-id="#consultationForm2">Заказать</button>',
        iconContent: "36м",
      },
    },
    {
      id: 353,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.474316", "37.739238"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 74м",
        balloonContentBody:
          'Адрес: <b>Логистическая улица, 1/5</b> <br> Глубина: <b>74 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Логистическая улица, 1/5" data-id="#consultationForm2">Заказать</button>',
        iconContent: "74м",
      },
    },
    {
      id: 354,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.464358", "37.715940"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 40м",
        balloonContentBody:
          'Адрес: <b>Домодедово</b> <br> Глубина: <b>40 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Домодедово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "40м",
      },
    },
    {
      id: 355,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.460213", "37.678592"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 41м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Форвард</b> <br> Глубина: <b>41 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Форвард" data-id="#consultationForm2">Заказать</button>',
        iconContent: "41м",
      },
    },
    {
      id: 356,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.457686", "37.639389"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 40м",
        balloonContentBody:
          'Адрес: <b>Садовая улица</b> <br> Глубина: <b>40 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Садовая улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "40м",
      },
    },
    {
      id: 357,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.423356", "37.735961"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 68м",
        balloonContentBody:
          'Адрес: <b>улица Лесная Опушка, 7</b> <br> Глубина: <b>68 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="улица Лесная Опушка, 7" data-id="#consultationForm2">Заказать</button>',
        iconContent: "68м",
      },
    },
    {
      id: 358,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.445329", "37.731506"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 41м",
        balloonContentBody:
          'Адрес: <b>микрорайон Центральный</b> <br> Глубина: <b>41 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="микрорайон Центральный" data-id="#consultationForm2">Заказать</button>',
        iconContent: "41м",
      },
    },
    {
      id: 359,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.433801", "37.785345"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 42м",
        balloonContentBody:
          'Адрес: <b>СНТ Металлург-2, 245</b> <br> Глубина: <b>42 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Металлург-2, 245" data-id="#consultationForm2">Заказать</button>',
        iconContent: "42м",
      },
    },
    {
      id: 360,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.436256", "37.785309"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>2-я линия</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="2-я линия" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 361,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.446284", "37.788782"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 55м",
        balloonContentBody:
          'Адрес: <b>4-я линия, 160</b> <br> Глубина: <b>55 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="4-я линия, 160" data-id="#consultationForm2">Заказать</button>',
        iconContent: "55м",
      },
    },
    {
      id: 362,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.478616", "37.752472"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 40м",
        balloonContentBody:
          'Адрес: <b>Центральная улица</b> <br> Глубина: <b>40 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Центральная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "40м",
      },
    },
    {
      id: 363,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.480676", "37.755474"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 31м",
        balloonContentBody:
          'Адрес: <b>Северный проезд</b> <br> Глубина: <b>31 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Северный проезд" data-id="#consultationForm2">Заказать</button>',
        iconContent: "31м",
      },
    },
    {
      id: 364,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.482874", "37.747989"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 34м",
        balloonContentBody:
          'Адрес: <b>Южная улица, 12</b> <br> Глубина: <b>34 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Южная улица, 12" data-id="#consultationForm2">Заказать</button>',
        iconContent: "34м",
      },
    },
    {
      id: 365,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.488708", "37.754868"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 46.36м",
        balloonContentBody:
          'Адрес: <b>Почтовая улица, 2</b> <br> Глубина: <b>46.36 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Почтовая улица, 2" data-id="#consultationForm2">Заказать</button>',
        iconContent: "46.36м",
      },
    },
    {
      id: 366,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.489359", "37.756827"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 42м",
        balloonContentBody:
          'Адрес: <b>Посадская улица, 7</b> <br> Глубина: <b>42 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Посадская улица, 7" data-id="#consultationForm2">Заказать</button>',
        iconContent: "42м",
      },
    },
    {
      id: 367,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.494071", "37.759525"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 55м",
        balloonContentBody:
          'Адрес: <b>Луговая улица, 24</b> <br> Глубина: <b>55 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Луговая улица, 24" data-id="#consultationForm2">Заказать</button>',
        iconContent: "55м",
      },
    },
    {
      id: 368,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.502954", "37.754031"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 63м",
        balloonContentBody:
          'Адрес: <b>Весенняя улица, 1к1</b> <br> Глубина: <b>63 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Весенняя улица, 1к1" data-id="#consultationForm2">Заказать</button>',
        iconContent: "63м",
      },
    },
    {
      id: 369,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.496004", "37.737893"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 45м",
        balloonContentBody:
          'Адрес: <b>жилой комплекс Прибрежный Парк, к6.1</b> <br> Глубина: <b>45 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="жилой комплекс Прибрежный Парк, к6.1" data-id="#consultationForm2">Заказать</button>',
        iconContent: "45м",
      },
    },
    {
      id: 370,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.498311", "37.739402"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 42м",
        balloonContentBody:
          'Адрес: <b>жилой комплекс Прибрежный Парк</b> <br> Глубина: <b>42 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="жилой комплекс Прибрежный Парк" data-id="#consultationForm2">Заказать</button>',
        iconContent: "42м",
      },
    },
    {
      id: 371,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.533553", "37.604897"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 72м",
        balloonContentBody:
          'Адрес: <b>СНТ Урожай, 83</b> <br> Глубина: <b>72 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Урожай, 83" data-id="#consultationForm2">Заказать</button>',
        iconContent: "72м",
      },
    },
    {
      id: 372,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.423871", "37.116873"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 65м",
        balloonContentBody:
          'Адрес: <b>деревня Лужки, уч50</b> <br> Глубина: <b>65 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Лужки, уч50" data-id="#consultationForm2">Заказать</button>',
        iconContent: "65м",
      },
    },
    {
      id: 373,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.417393", "37.078519"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 55м",
        balloonContentBody:
          'Адрес: <b>СНТ Тимирязевец, 165</b> <br> Глубина: <b>55 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Тимирязевец, 165" data-id="#consultationForm2">Заказать</button>',
        iconContent: "55м",
      },
    },
    {
      id: 374,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.374989", "37.360241"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 48м",
        balloonContentBody:
          'Адрес: <b>деревня Сатино-Русское, 17</b> <br> Глубина: <b>48 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Сатино-Русское, 17" data-id="#consultationForm2">Заказать</button>',
        iconContent: "48м",
      },
    },
    {
      id: 375,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.363624", "37.527071"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 108м",
        balloonContentBody:
          'Адрес: <b>улица Ленина, 1с2</b> <br> Глубина: <b>108 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="улица Ленина, 1с2" data-id="#consultationForm2">Заказать</button>',
        iconContent: "108м",
      },
    },
    {
      id: 376,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.401324", "37.385229"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 69м",
        balloonContentBody:
          'Адрес: <b>к.п. "Александровы Пруды", ул. Капитанская</b> <br> Глубина: <b>69 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="к.п. "Александровы Пруды", ул. Капитанская" data-id="#consultationForm2">Заказать</button>',
        iconContent: "69м",
      },
    },
    {
      id: 377,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.390259", "37.387697"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>улица Русинская Роща</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="улица Русинская Роща" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 378,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.401855", "37.447721"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 80м",
        balloonContentBody:
          'Адрес: <b>Северная улица</b> <br> Глубина: <b>80 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Северная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "80м",
      },
    },
    {
      id: 379,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.380190", "37.419936"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 38м",
        balloonContentBody:
          'Адрес: <b>п. Щаповское, вблизи д. Костишово</b> <br> Глубина: <b>38 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="п. Щаповское, вблизи д. Костишово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "38м",
      },
    },
    {
      id: 380,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.374945", "37.360220"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 48м",
        balloonContentBody:
          'Адрес: <b>деревня Сатино-Русское</b> <br> Глубина: <b>48 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Сатино-Русское" data-id="#consultationForm2">Заказать</button>',
        iconContent: "48м",
      },
    },
    {
      id: 381,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.357030", "37.450674"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 60м",
        balloonContentBody:
          'Адрес: <b>СНТ Оазис, 40</b> <br> Глубина: <b>60 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Оазис, 40" data-id="#consultationForm2">Заказать</button>',
        iconContent: "60м",
      },
    },
    {
      id: 382,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.343491", "37.452434"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 62м",
        balloonContentBody:
          'Адрес: <b>деревня Лучинское</b> <br> Глубина: <b>62 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Лучинское" data-id="#consultationForm2">Заказать</button>',
        iconContent: "62м",
      },
    },
    {
      id: 383,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.341926", "37.455512"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 38м",
        balloonContentBody:
          'Адрес: <b>СНТ Радуга уч. 18</b> <br> Глубина: <b>38 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Радуга уч. 18" data-id="#consultationForm2">Заказать</button>',
        iconContent: "38м",
      },
    },
    {
      id: 384,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.467662", "37.586877"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 58м",
        balloonContentBody:
          'Адрес: <b>СНТ Москвич, 131</b> <br> Глубина: <b>58 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Москвич, 131" data-id="#consultationForm2">Заказать</button>',
        iconContent: "58м",
      },
    },
    {
      id: 385,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.470224", "37.597486"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 35м",
        balloonContentBody:
          'Адрес: <b>Луговая улица, 14</b> <br> Глубина: <b>35 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Луговая улица, 14" data-id="#consultationForm2">Заказать</button>',
        iconContent: "35м",
      },
    },
    {
      id: 386,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.484000", "37.584592"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 65м",
        balloonContentBody:
          'Адрес: <b>СНТ Берёзка, 27</b> <br> Глубина: <b>65 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Берёзка, 27" data-id="#consultationForm2">Заказать</button>',
        iconContent: "65м",
      },
    },
    {
      id: 387,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.477469", "37.636351"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 66м",
        balloonContentBody:
          'Адрес: <b>деревня Бяконтово</b> <br> Глубина: <b>66 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Бяконтово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "66м",
      },
    },
    {
      id: 388,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.339900", "37.561814"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 52м",
        balloonContentBody:
          'Адрес: <b>СНТ Испытатель-2, 192</b> <br> Глубина: <b>52 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Испытатель-2, 192" data-id="#consultationForm2">Заказать</button>',
        iconContent: "52м",
      },
    },
    {
      id: 389,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.337924", "37.577844"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 54м",
        balloonContentBody:
          'Адрес: <b>АЗС Татнефть</b> <br> Глубина: <b>54 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="АЗС Татнефть" data-id="#consultationForm2">Заказать</button>',
        iconContent: "54м",
      },
    },
    {
      id: 390,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.318521", "37.564595"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>деревня Алтухово, 10</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Алтухово, 10" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 391,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.323292", "37.597053"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 54м",
        balloonContentBody:
          'Адрес: <b>Полевая улица</b> <br> Глубина: <b>54 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Полевая улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "54м",
      },
    },
    {
      id: 392,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.398871", "37.700478"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 115м",
        balloonContentBody:
          'Адрес: <b>Прилесная улица, 33</b> <br> Глубина: <b>115 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Прилесная улица, 33" data-id="#consultationForm2">Заказать</button>',
        iconContent: "115м",
      },
    },
    {
      id: 393,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.395131", "37.700705"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>Майский переулок</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Майский переулок" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 394,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.396422", "37.704391"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 45м",
        balloonContentBody:
          'Адрес: <b>Юсупово</b> <br> Глубина: <b>45 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Юсупово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "45м",
      },
    },
    {
      id: 395,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.396173", "37.707247"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 40м",
        balloonContentBody:
          'Адрес: <b>деревня Юсупово, 16</b> <br> Глубина: <b>40 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Юсупово, 16" data-id="#consultationForm2">Заказать</button>',
        iconContent: "40м",
      },
    },
    {
      id: 396,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.391992", "37.673394"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>Центральная улица</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Центральная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 397,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.414804", "37.657304"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 47м",
        balloonContentBody:
          'Адрес: <b>деревня Жуково, 35</b> <br> Глубина: <b>47 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Жуково, 35" data-id="#consultationForm2">Заказать</button>',
        iconContent: "47м",
      },
    },
    {
      id: 398,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.420125", "37.651613"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>СНТ Радуга, 326</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Радуга, 326" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 399,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.423733", "37.650001"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 42м",
        balloonContentBody:
          'Адрес: <b>деревня Крюково, 19</b> <br> Глубина: <b>42 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Крюково, 19" data-id="#consultationForm2">Заказать</button>',
        iconContent: "42м",
      },
    },
    {
      id: 400,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.413506", "37.811979"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 43м",
        balloonContentBody:
          'Адрес: <b>1-я Садовая улица, 34</b> <br> Глубина: <b>43 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="1-я Садовая улица, 34" data-id="#consultationForm2">Заказать</button>',
        iconContent: "43м",
      },
    },
    {
      id: 401,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.410695", "37.815112"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 45м",
        balloonContentBody:
          'Адрес: <b>Центральная улица, 38</b> <br> Глубина: <b>45 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Центральная улица, 38" data-id="#consultationForm2">Заказать</button>',
        iconContent: "45м",
      },
    },
    {
      id: 402,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.408689", "37.818423"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 41м",
        balloonContentBody:
          'Адрес: <b>СНТ Востряково-ЗИЛ, 308</b> <br> Глубина: <b>41 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Востряково-ЗИЛ, 308" data-id="#consultationForm2">Заказать</button>',
        iconContent: "41м",
      },
    },
    {
      id: 403,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.408215", "37.818289"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 41м",
        balloonContentBody:
          'Адрес: <b>6-я Садовая улица, 12</b> <br> Глубина: <b>41 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="6-я Садовая улица, 12" data-id="#consultationForm2">Заказать</button>',
        iconContent: "41м",
      },
    },
    {
      id: 404,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.414914", "37.835996"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 41м",
        balloonContentBody:
          'Адрес: <b>площадь Гагарина</b> <br> Глубина: <b>41 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="площадь Гагарина" data-id="#consultationForm2">Заказать</button>',
        iconContent: "41м",
      },
    },
    {
      id: 405,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.400859", "37.805691"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 42м",
        balloonContentBody:
          'Адрес: <b>микрорайон Востряково</b> <br> Глубина: <b>42 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="микрорайон Востряково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "42м",
      },
    },
    {
      id: 406,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.382194", "37.779393"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 55м",
        balloonContentBody:
          'Адрес: <b>СНТ Новое Заборье</b> <br> Глубина: <b>55 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Новое Заборье" data-id="#consultationForm2">Заказать</button>',
        iconContent: "55м",
      },
    },
    {
      id: 407,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.380355", "37.781278"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 51м",
        balloonContentBody:
          'Адрес: <b>микрорайон Востряково</b> <br> Глубина: <b>51 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="микрорайон Востряково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "51м",
      },
    },
    {
      id: 408,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.363775", "37.766443"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 58м",
        balloonContentBody:
          'Адрес: <b>СНТ Подмосковье, 210</b> <br> Глубина: <b>58 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Подмосковье, 210" data-id="#consultationForm2">Заказать</button>',
        iconContent: "58м",
      },
    },
    {
      id: 409,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.358705", "37.738499"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 72м",
        balloonContentBody:
          'Адрес: <b>деревня Одинцово, 3А</b> <br> Глубина: <b>72 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Одинцово, 3А" data-id="#consultationForm2">Заказать</button>',
        iconContent: "72м",
      },
    },
    {
      id: 410,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.343802", "37.727642"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 30м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Ильинское</b> <br> Глубина: <b>30 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Ильинское" data-id="#consultationForm2">Заказать</button>',
        iconContent: "30м",
      },
    },
    {
      id: 411,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.340579", "37.771723"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 40м",
        balloonContentBody:
          'Адрес: <b>деревня Вахромеево, 13Б</b> <br> Глубина: <b>40 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Вахромеево, 13Б" data-id="#consultationForm2">Заказать</button>',
        iconContent: "40м",
      },
    },
    {
      id: 412,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.337375", "37.773996"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 50м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Сиеста Южная</b> <br> Глубина: <b>50 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Сиеста Южная" data-id="#consultationForm2">Заказать</button>',
        iconContent: "50м",
      },
    },
    {
      id: 413,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.340476", "37.781578"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 55м",
        balloonContentBody:
          'Адрес: <b>территория Сиеста Восточная, 132</b> <br> Глубина: <b>55 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="территория Сиеста Восточная, 132" data-id="#consultationForm2">Заказать</button>',
        iconContent: "55м",
      },
    },
    {
      id: 414,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.340613", "37.784883"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 54м",
        balloonContentBody:
          'Адрес: <b>территория Сиеста Восточная, 348</b> <br> Глубина: <b>54 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="территория Сиеста Восточная, 348" data-id="#consultationForm2">Заказать</button>',
        iconContent: "54м",
      },
    },
    {
      id: 415,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.591370", "37.319981"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 80м",
        balloonContentBody:
          'Адрес: <b>деревня Мешково, 133</b> <br> Глубина: <b>80 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Мешково, 133" data-id="#consultationForm2">Заказать</button>',
        iconContent: "80м",
      },
    },
    {
      id: 416,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.583187", "37.379080"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 60м",
        balloonContentBody:
          'Адрес: <b>сдт "Просвещенец", ул. Центральная</b> <br> Глубина: <b>60 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="сдт "Просвещенец", ул. Центральная" data-id="#consultationForm2">Заказать</button>',
        iconContent: "60м",
      },
    },
    {
      id: 417,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.579919", "37.391285"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'Адрес: <b>Вишнёвый тупик, 2с1</b> <br> Глубина: <b>90 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Вишнёвый тупик, 2с1" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 418,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.582085", "37.393452"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 60м",
        balloonContentBody:
          'Адрес: <b>Еловая улица, 19</b> <br> Глубина: <b>60 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Еловая улица, 19" data-id="#consultationForm2">Заказать</button>',
        iconContent: "60м",
      },
    },
    {
      id: 419,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.587297", "37.442319"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 32.50м",
        balloonContentBody:
          'Адрес: <b>СНТ Коммунарка-2, 121</b> <br> Глубина: <b>32.50 м</b> <br> Статус: <b>Песчаная скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Коммунарка-2, 121" data-id="#consultationForm2">Заказать</button>',
        iconContent: "32.50м",
      },
    },
    {
      id: 420,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.558123", "37.422112"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 70м",
        balloonContentBody:
          'Адрес: <b>Зимёнковская улица</b> <br> Глубина: <b>70 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Зимёнковская улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "70м",
      },
    },
    {
      id: 421,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.544049", "37.389713"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 41м",
        balloonContentBody:
          'Адрес: <b>СНТ Ракитки, 130</b> <br> Глубина: <b>41 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Ракитки, 130" data-id="#consultationForm2">Заказать</button>',
        iconContent: "41м",
      },
    },
    {
      id: 422,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.543334", "37.384911"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 113м",
        balloonContentBody:
          'Адрес: <b>квартал № 3, 171</b> <br> Глубина: <b>113 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="квартал № 3, 171" data-id="#consultationForm2">Заказать</button>',
        iconContent: "113м",
      },
    },
    {
      id: 423,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.548513", "37.360187"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 88м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Праймвиль, 4</b> <br> Глубина: <b>88 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Праймвиль, 4" data-id="#consultationForm2">Заказать</button>',
        iconContent: "88м",
      },
    },
    {
      id: 424,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.551895", "37.354398"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 60м",
        balloonContentBody:
          'Адрес: <b>посёлок Филимонки, 12</b> <br> Глубина: <b>60 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="посёлок Филимонки, 12" data-id="#consultationForm2">Заказать</button>',
        iconContent: "60м",
      },
    },
    {
      id: 425,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.542678", "37.336071"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 55м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Есенино, 48</b> <br> Глубина: <b>55 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Есенино, 48" data-id="#consultationForm2">Заказать</button>',
        iconContent: "55м",
      },
    },
    {
      id: 426,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.543598", "37.322201"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 60м",
        balloonContentBody:
          'Адрес: <b>3-я Солнечная аллея, 30</b> <br> Глубина: <b>60 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="3-я Солнечная аллея, 30" data-id="#consultationForm2">Заказать</button>',
        iconContent: "60м",
      },
    },
    {
      id: 427,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.556168", "37.334200"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 43м",
        balloonContentBody:
          'Адрес: <b>Марьино</b> <br> Глубина: <b>43 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Марьино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "43м",
      },
    },
    {
      id: 428,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.553091", "37.304872"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 46м",
        balloonContentBody:
          'Адрес: <b>деревня Харьино</b> <br> Глубина: <b>46 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Харьино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "46м",
      },
    },
    {
      id: 429,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.561732", "37.292110"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 45м",
        balloonContentBody:
          'Адрес: <b>поселение Филимонковское д. Середнево</b> <br> Глубина: <b>45 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="поселение Филимонковское д. Середнево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "45м",
      },
    },
    {
      id: 430,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.563399", "37.273490"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 67м",
        balloonContentBody:
          'Адрес: <b>Речная улица, 8</b> <br> Глубина: <b>67 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Речная улица, 8" data-id="#consultationForm2">Заказать</button>',
        iconContent: "67м",
      },
    },
    {
      id: 431,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.563819", "37.268857"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 53м",
        balloonContentBody:
          'Адрес: <b>деревня Бурцево, 38</b> <br> Глубина: <b>53 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Бурцево, 38" data-id="#consultationForm2">Заказать</button>',
        iconContent: "53м",
      },
    },
    {
      id: 432,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.558009", "37.262073"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 70м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Променад, 34</b> <br> Глубина: <b>70 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Променад, 34" data-id="#consultationForm2">Заказать</button>',
        iconContent: "70м",
      },
    },
    {
      id: 433,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.553955", "37.259554"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 68м",
        balloonContentBody:
          'Адрес: <b>Марушкинское поселение, снт Вузсервис</b> <br> Глубина: <b>68 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Марушкинское поселение, снт Вузсервис" data-id="#consultationForm2">Заказать</button>',
        iconContent: "68м",
      },
    },
    {
      id: 434,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.556087", "37.246828"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 65м",
        balloonContentBody:
          'Адрес: <b>Марушкинское поселение, Акиньшино</b> <br> Глубина: <b>65 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Марушкинское поселение, Акиньшино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "65м",
      },
    },
    {
      id: 435,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.532963", "37.269812"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 60м",
        balloonContentBody:
          'Адрес: <b>Журавлиная улица, 122</b> <br> Глубина: <b>60 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Журавлиная улица, 122" data-id="#consultationForm2">Заказать</button>',
        iconContent: "60м",
      },
    },
    {
      id: 436,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.524826", "37.262675"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 73м",
        balloonContentBody:
          'Адрес: <b>Дорожная улица, 2с1</b> <br> Глубина: <b>73 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Дорожная улица, 2с1" data-id="#consultationForm2">Заказать</button>',
        iconContent: "73м",
      },
    },
    {
      id: 437,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.521981", "37.262675"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 51м",
        balloonContentBody:
          'Адрес: <b>Дорожная улица, 2</b> <br> Глубина: <b>51 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Дорожная улица, 2" data-id="#consultationForm2">Заказать</button>',
        iconContent: "51м",
      },
    },
    {
      id: 438,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.575789", "37.274629"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 51м",
        balloonContentBody:
          'Адрес: <b>1-й Новобурцевский переулок, 4с1</b> <br> Глубина: <b>51 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="1-й Новобурцевский переулок, 4с1" data-id="#consultationForm2">Заказать</button>',
        iconContent: "51м",
      },
    },
    {
      id: 439,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.579106", "37.269696"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 55м",
        balloonContentBody:
          'Адрес: <b>5-й Новобурцевский переулок, 9</b> <br> Глубина: <b>55 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="5-й Новобурцевский переулок, 9" data-id="#consultationForm2">Заказать</button>',
        iconContent: "55м",
      },
    },
    {
      id: 440,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.603649", "37.238413"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 65м",
        balloonContentBody:
          'Адрес: <b>Постниково, пер. Огородный</b> <br> Глубина: <b>65 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Постниково, пер. Огородный" data-id="#consultationForm2">Заказать</button>',
        iconContent: "65м",
      },
    },
    {
      id: 441,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.602983", "37.227585"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 62м",
        balloonContentBody:
          'Адрес: <b>Садовый переулок, 10А</b> <br> Глубина: <b>62 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Садовый переулок, 10А" data-id="#consultationForm2">Заказать</button>',
        iconContent: "62м",
      },
    },
    {
      id: 442,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.607789", "37.201743"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 72м",
        balloonContentBody:
          'Адрес: <b>СНТ Толстопальцево-5, 600с1</b> <br> Глубина: <b>72 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Толстопальцево-5, 600с1" data-id="#consultationForm2">Заказать</button>',
        iconContent: "72м",
      },
    },
    {
      id: 443,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.612271", "37.206926"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 70м",
        balloonContentBody:
          'Адрес: <b>улица Осипенко, 13</b> <br> Глубина: <b>70 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="улица Осипенко, 13" data-id="#consultationForm2">Заказать</button>',
        iconContent: "70м",
      },
    },
    {
      id: 444,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.612367", "37.207003"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 70м",
        balloonContentBody:
          'Адрес: <b>улица Осипенко, 15с</b> <br> Глубина: <b>70 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="улица Осипенко, 15с" data-id="#consultationForm2">Заказать</button>',
        iconContent: "70м",
      },
    },
    {
      id: 445,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.616593", "37.205582"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 70м",
        balloonContentBody:
          'Адрес: <b>посёлок Толстопальцево</b> <br> Глубина: <b>70 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="посёлок Толстопальцево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "70м",
      },
    },
    {
      id: 446,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.632313", "37.229384"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 84м",
        balloonContentBody:
          'Адрес: <b>Осоргино</b> <br> Глубина: <b>84 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Осоргино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "84м",
      },
    },
    {
      id: 447,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.634008", "37.230999"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 85м",
        balloonContentBody:
          'Адрес: <b>деревня Осоргино, Одинцовский городской округ</b> <br> Глубина: <b>85 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Осоргино, Одинцовский городской округ" data-id="#consultationForm2">Заказать</button>',
        iconContent: "85м",
      },
    },
    {
      id: 448,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.633274", "37.223506"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 75м",
        balloonContentBody:
          'Адрес: <b>деревня Осоргино, 32</b> <br> Глубина: <b>75 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Осоргино, 32" data-id="#consultationForm2">Заказать</button>',
        iconContent: "75м",
      },
    },
    {
      id: 449,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.634786", "37.224416"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 87м",
        balloonContentBody:
          'Адрес: <b>деревня Осоргино, 25Б</b> <br> Глубина: <b>87 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Осоргино, 25Б" data-id="#consultationForm2">Заказать</button>',
        iconContent: "87м",
      },
    },
    {
      id: 450,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.646720", "37.264451"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 112м",
        balloonContentBody:
          'Адрес: <b>деревня Внуково, 11</b> <br> Глубина: <b>112 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Внуково, 11" data-id="#consultationForm2">Заказать</button>',
        iconContent: "112м",
      },
    },
    {
      id: 451,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.640902", "37.334012"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 99м",
        balloonContentBody:
          'Адрес: <b>13-й микрорайон</b> <br> Глубина: <b>99 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="13-й микрорайон" data-id="#consultationForm2">Заказать</button>',
        iconContent: "99м",
      },
    },
    {
      id: 452,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.647694", "37.317512"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 91м",
        balloonContentBody:
          'Адрес: <b>улица Ленина, 54с2</b> <br> Глубина: <b>91 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="улица Ленина, 54с2" data-id="#consultationForm2">Заказать</button>',
        iconContent: "91м",
      },
    },
    {
      id: 453,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.648426", "37.325229"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 97м",
        balloonContentBody:
          'Адрес: <b>улица Ленина, 28</b> <br> Глубина: <b>97 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="улица Ленина, 28" data-id="#consultationForm2">Заказать</button>',
        iconContent: "97м",
      },
    },
    {
      id: 454,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.652613", "37.339044"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 126м",
        balloonContentBody:
          'Адрес: <b>1-я улица Лукино</b> <br> Глубина: <b>126 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="1-я улица Лукино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "126м",
      },
    },
    {
      id: 455,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.628110", "37.385326"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 119м",
        balloonContentBody:
          'Адрес: <b>Московский, квартал 35</b> <br> Глубина: <b>119 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Московский, квартал 35" data-id="#consultationForm2">Заказать</button>',
        iconContent: "119м",
      },
    },
    {
      id: 456,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.627203", "37.408781"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 100м",
        balloonContentBody:
          'Адрес: <b>Московский, квартал № 33</b> <br> Глубина: <b>100 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Московский, квартал № 33" data-id="#consultationForm2">Заказать</button>',
        iconContent: "100м",
      },
    },
    {
      id: 457,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.651089", "37.431005"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 150м",
        balloonContentBody:
          'Адрес: <b>поселок Московский, вблизи деревни Говорово</b> <br> Глубина: <b>150 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="поселок Московский, вблизи деревни Говорово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "150м",
      },
    },
    {
      id: 458,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.656983", "37.417595"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 150м",
        balloonContentBody:
          'Адрес: <b>СНТ Отдых, 18с1</b> <br> Глубина: <b>150 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Отдых, 18с1" data-id="#consultationForm2">Заказать</button>',
        iconContent: "150м",
      },
    },
    {
      id: 459,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.655405", "37.421494"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 23м",
        balloonContentBody:
          'Адрес: <b>Восточный проезд, 11с1</b> <br> Глубина: <b>23 м</b> <br> Статус: <b>Песчаная скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Восточный проезд, 11с1" data-id="#consultationForm2">Заказать</button>',
        iconContent: "23м",
      },
    },
    {
      id: 460,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.646714", "37.264467"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 112м",
        balloonContentBody:
          'Адрес: <b>деревня Внуково, 11</b> <br> Глубина: <b>112 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Внуково, 11" data-id="#consultationForm2">Заказать</button>',
        iconContent: "112м",
      },
    },
    {
      id: 461,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.681117", "37.363756"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 106м",
        balloonContentBody:
          'Адрес: <b>деревня Немчиново</b> <br> Глубина: <b>106 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Немчиново" data-id="#consultationForm2">Заказать</button>',
        iconContent: "106м",
      },
    },
    {
      id: 462,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.680146", "37.363392"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 114м",
        balloonContentBody:
          'Адрес: <b>деревня Немчиново, 98</b> <br> Глубина: <b>114 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Немчиново, 98" data-id="#consultationForm2">Заказать</button>',
        iconContent: "114м",
      },
    },
    {
      id: 463,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.687655", "37.343445"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 120м",
        balloonContentBody:
          'Адрес: <b>Инновационный центр Сколково</b> <br> Глубина: <b>120 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Инновационный центр Сколково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "120м",
      },
    },
    {
      id: 464,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.693324", "37.338289"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 125м",
        balloonContentBody:
          'Адрес: <b>территориальное управление Новоивановское</b> <br> Глубина: <b>125 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="территориальное управление Новоивановское" data-id="#consultationForm2">Заказать</button>',
        iconContent: "125м",
      },
    },
    {
      id: 465,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.687292", "37.315465"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 128м",
        balloonContentBody:
          'Адрес: <b>Колхозная улица, 109</b> <br> Глубина: <b>128 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Колхозная улица, 109" data-id="#consultationForm2">Заказать</button>',
        iconContent: "128м",
      },
    },
    {
      id: 465,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.694893", "37.314402"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 134м",
        balloonContentBody:
          'Адрес: <b>СНТ Баковка</b> <br> Глубина: <b>134 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Баковка" data-id="#consultationForm2">Заказать</button>',
        iconContent: "134м",
      },
    },
    {
      id: 466,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.708169", "37.282367"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 115м",
        balloonContentBody:
          'Адрес: <b>территория Подушкино-Таун, 8</b> <br> Глубина: <b>115 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="территория Подушкино-Таун, 8" data-id="#consultationForm2">Заказать</button>',
        iconContent: "115м",
      },
    },
    {
      id: 467,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.713341", "37.274675"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 101м",
        balloonContentBody:
          'Адрес: <b>деревня Подушкино</b> <br> Глубина: <b>101 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Подушкино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "101м",
      },
    },
    {
      id: 468,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.716327", "37.280675"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 100м",
        balloonContentBody:
          'Адрес: <b>деревня Рождественно, 43А</b> <br> Глубина: <b>100 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Рождественно, 43А" data-id="#consultationForm2">Заказать</button>',
        iconContent: "100м",
      },
    },
    {
      id: 469,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.717043", "37.279785"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 100м",
        balloonContentBody:
          'Адрес: <b>деревня Рождественно, Одинцовский городской округ</b> <br> Глубина: <b>100 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Рождественно, Одинцовский городской округ" data-id="#consultationForm2">Заказать</button>',
        iconContent: "100м",
      },
    },
    {
      id: 470,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.717083", "37.280080"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 100м",
        balloonContentBody:
          'Адрес: <b>Одинцовский Район, Рождественно</b> <br> Глубина: <b>99 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Одинцовский Район, Рождественно" data-id="#consultationForm2">Заказать</button>',
        iconContent: "99м",
      },
    },
    {
      id: 471,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.721425", "37.279294"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'Адрес: <b>посёлок Барвиха</b> <br> Глубина: <b>90 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="посёлок Барвиха" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 472,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.726200", "37.274610"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 82м",
        balloonContentBody:
          'Адрес: <b>Одинцовский Район Барвиха</b> <br> Глубина: <b>82 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Одинцовский Район Барвиха" data-id="#consultationForm2">Заказать</button>',
        iconContent: "82м",
      },
    },
    {
      id: 473,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.728234", "37.297121"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 97м",
        balloonContentBody:
          'Адрес: <b>деревня Шульгино</b> <br> Глубина: <b>97 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Шульгино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "97м",
      },
    },
    {
      id: 474,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.721247", "37.365457"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 114м",
        balloonContentBody:
          'Адрес: <b>8-й просек</b> <br> Глубина: <b>114 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="8-й просек" data-id="#consultationForm2">Заказать</button>',
        iconContent: "114м",
      },
    },
    {
      id: 475,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.724392", "37.224309"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 112м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Ландшафт</b> <br> Глубина: <b>112 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Ландшафт" data-id="#consultationForm2">Заказать</button>',
        iconContent: "112м",
      },
    },
    {
      id: 476,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.711128", "37.198461"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 117м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Малое Сареево</b> <br> Глубина: <b>117 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Малое Сареево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "117м",
      },
    },
    {
      id: 477,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.712717", "37.188516"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 95м",
        balloonContentBody:
          'Адрес: <b>деревня Большое Сареево</b> <br> Глубина: <b>95 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Большое Сареево" data-id="#consultationForm2">Заказать</button>',
        iconContent: "95м",
      },
    },
    {
      id: 478,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.710405", "37.183778"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 110м",
        balloonContentBody:
          'Адрес: <b>деревня Большое Сареево, 34</b> <br> Глубина: <b>110 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Большое Сареево, 34" data-id="#consultationForm2">Заказать</button>',
        iconContent: "110м",
      },
    },
    {
      id: 479,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.710503", "37.183358"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 88м",
        balloonContentBody:
          'Адрес: <b>деревня Большое Сареево, 32А</b> <br> Глубина: <b>88 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Большое Сареево, 32А" data-id="#consultationForm2">Заказать</button>',
        iconContent: "88м",
      },
    },
    {
      id: 480,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.707710", "37.180174"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 88м",
        balloonContentBody:
          'Адрес: <b>деревня Большое Сареево, 38</b> <br> Глубина: <b>88 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Большое Сареево, 38" data-id="#consultationForm2">Заказать</button>',
        iconContent: "88м",
      },
    },
    {
      id: 481,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.698295", "37.160224"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 117м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Резиденции Берёзки, 23</b> <br> Глубина: <b>117 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Резиденции Берёзки, 23" data-id="#consultationForm2">Заказать</button>',
        iconContent: "117м",
      },
    },
    {
      id: 482,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.706117", "37.153748"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 150м",
        balloonContentBody:
          'Адрес: <b>кооператив индивидуальных застройщиков Горки-8, 62</b> <br> Глубина: <b>150 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="кооператив индивидуальных застройщиков Горки-8, 62" data-id="#consultationForm2">Заказать</button>',
        iconContent: "150м",
      },
    },
    {
      id: 483,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.706301", "37.150800"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 135м",
        balloonContentBody:
          'Адрес: <b>кооператив индивидуальных застройщиков Горки-8</b> <br> Глубина: <b>135 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="кооператив индивидуальных застройщиков Горки-8" data-id="#consultationForm2">Заказать</button>',
        iconContent: "135м",
      },
    },
    {
      id: 484,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.695541", "37.133526"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 104м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Заря, 39</b> <br> Глубина: <b>104 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Заря, 39" data-id="#consultationForm2">Заказать</button>',
        iconContent: "104м",
      },
    },
    {
      id: 485,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.700861", "37.121582"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 95м",
        balloonContentBody:
          'Адрес: <b>Изумрудная улица</b> <br> Глубина: <b>95 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Изумрудная улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "95м",
      },
    },
    {
      id: 486,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.701017", "37.118291"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'Адрес: <b>Изумрудная улица, 49</b> <br> Глубина: <b>90 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Изумрудная улица, 49" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 487,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.697891", "37.116517"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 106м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Эрмитаж-Вилладж</b> <br> Глубина: <b>106 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Эрмитаж-Вилладж" data-id="#consultationForm2">Заказать</button>',
        iconContent: "106м",
      },
    },
    {
      id: 488,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.693788", "37.096086"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 104м",
        balloonContentBody:
          'Адрес: <b>Парковая улица</b> <br> Глубина: <b>104 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Парковая улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "104м",
      },
    },
    {
      id: 489,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.687299", "37.087965"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 102м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Николино, 162</b> <br> Глубина: <b>102 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Николино, 162" data-id="#consultationForm2">Заказать</button>',
        iconContent: "102м",
      },
    },
    {
      id: 490,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.685776", "37.069240"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 99м",
        balloonContentBody:
          'Адрес: <b>деревня Таганьково</b> <br> Глубина: <b>99 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Таганьково" data-id="#consultationForm2">Заказать</button>',
        iconContent: "99м",
      },
    },
    {
      id: 491,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.685571", "37.068584"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 93м",
        balloonContentBody:
          'Адрес: <b>деревня Таганьково, Одинцовский городской округ</b> <br> Глубина: <b>93 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Таганьково, Одинцовский городской округ" data-id="#consultationForm2">Заказать</button>',
        iconContent: "93м",
      },
    },
    {
      id: 492,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.685162", "37.063680"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 107м",
        balloonContentBody:
          'Адрес: <b>территориальное управление Назарьевское</b> <br> Глубина: <b>107 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="территориальное управление Назарьевское" data-id="#consultationForm2">Заказать</button>',
        iconContent: "107м",
      },
    },
    {
      id: 493,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.679778", "37.085051"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 96м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Николино, 2</b> <br> Глубина: <b>96 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Николино, 2" data-id="#consultationForm2">Заказать</button>',
        iconContent: "96м",
      },
    },
    {
      id: 494,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.671667", "37.085004"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'Адрес: <b>садовое товарищество Каскад, 20</b> <br> Глубина: <b>90 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="садовое товарищество Каскад, 20" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 495,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.659864", "37.116190"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 111м",
        balloonContentBody:
          'Адрес: <b>СНТ Жаворонки-Север</b> <br> Глубина: <b>111 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Жаворонки-Север" data-id="#consultationForm2">Заказать</button>',
        iconContent: "111м",
      },
    },
    {
      id: 496,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.661323", "37.117876"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 106м",
        balloonContentBody:
          'Адрес: <b>Сиреневая улица, 8</b> <br> Глубина: <b>106 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Сиреневая улица, 8" data-id="#consultationForm2">Заказать</button>',
        iconContent: "106м",
      },
    },
    {
      id: 497,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.665348", "37.146629"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 103м",
        balloonContentBody:
          'Адрес: <b>территория КП Западная Резиденция, 27</b> <br> Глубина: <b>103 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="территория КП Западная Резиденция, 27" data-id="#consultationForm2">Заказать</button>',
        iconContent: "103м",
      },
    },
    {
      id: 498,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.673304", "37.139338"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 119м",
        balloonContentBody:
          'Адрес: <b>СНТ Учитель, 196</b> <br> Глубина: <b>119 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ Учитель, 196" data-id="#consultationForm2">Заказать</button>',
        iconContent: "119м",
      },
    },
    {
      id: 499,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.679064", "37.146185"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 110м",
        balloonContentBody:
          'Адрес: <b>деревня Лапино, 71</b> <br> Глубина: <b>110 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Лапино, 71" data-id="#consultationForm2">Заказать</button>',
        iconContent: "110м",
      },
    },
    {
      id: 500,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.678278", "37.152186"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 117м",
        balloonContentBody:
          'Адрес: <b>деревня Лапино</b> <br> Глубина: <b>117 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Лапино" data-id="#consultationForm2">Заказать</button>',
        iconContent: "117м",
      },
    },
    {
      id: 501,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.671833", "37.167781"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 110м",
        balloonContentBody:
          'Адрес: <b>ПЖСК Новая Деревня</b> <br> Глубина: <b>110 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="ПЖСК Новая Деревня" data-id="#consultationForm2">Заказать</button>',
        iconContent: "110м",
      },
    },
    {
      id: 502,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.662622", "37.177506"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 101м",
        balloonContentBody:
          'Адрес: <b>Красная улица, 12А</b> <br> Глубина: <b>101 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Красная улица, 12А" data-id="#consultationForm2">Заказать</button>',
        iconContent: "101м",
      },
    },
    {
      id: 503,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.665599", "37.196174"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 130м",
        balloonContentBody:
          'Адрес: <b>СНТ 40 лет Октября</b> <br> Глубина: <b>130 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="СНТ 40 лет Октября" data-id="#consultationForm2">Заказать</button>',
        iconContent: "130м",
      },
    },
    {
      id: 504,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.747320", "37.305525"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 62м",
        balloonContentBody:
          'Адрес: <b>деревня Раздоры, 2</b> <br> Глубина: <b>62 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Раздоры, 2" data-id="#consultationForm2">Заказать</button>',
        iconContent: "62м",
      },
    },
    {
      id: 505,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.741911", "37.256383"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 83м",
        balloonContentBody:
          'Адрес: <b>территория НПИЗ Речное</b> <br> Глубина: <b>83 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="территория НПИЗ Речное" data-id="#consultationForm2">Заказать</button>',
        iconContent: "83м",
      },
    },
    {
      id: 506,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.739083", "37.248107"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'Адрес: <b>деревня Жуковка, 118</b> <br> Глубина: <b>90 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Жуковка, 118" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 507,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.740304", "37.238889"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'Адрес: <b>улица Сосновый Бор</b> <br> Глубина: <b>90 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="улица Сосновый Бор" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 508,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.740304", "37.238889"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'Адрес: <b>улица Сосновый Бор</b> <br> Глубина: <b>90 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="улица Сосновый Бор" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 509,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.740304", "37.238889"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'Адрес: <b>улица Сосновый Бор</b> <br> Глубина: <b>90 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="улица Сосновый Бор" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 510,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.731124", "37.214464"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 22м",
        balloonContentBody:
          'Адрес: <b>село Усово</b> <br> Глубина: <b>22 м</b> <br> Статус: <b>Песчаная скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="село Усово" data-id="#consultationForm2">Заказать</button>',
        iconContent: "22м",
      },
    },
    {
      id: 511,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.730989", "37.153365"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 94м",
        balloonContentBody:
          'Адрес: <b>Девятая улица</b> <br> Глубина: <b>94 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Девятая улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "94м",
      },
    },
    {
      id: 512,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.731395", "37.150371"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 99м",
        balloonContentBody:
          'Адрес: <b>территория Знаменское Поле, 474</b> <br> Глубина: <b>99 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="территория Знаменское Поле, 474" data-id="#consultationForm2">Заказать</button>',
        iconContent: "99м",
      },
    },
    {
      id: 513,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.735189", "37.140110"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 91м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Севен хиллс, 4</b> <br> Глубина: <b>91 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Севен хиллс, 4" data-id="#consultationForm2">Заказать</button>',
        iconContent: "91м",
      },
    },
    {
      id: 514,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.736305", "37.142519"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 72м",
        balloonContentBody:
          'Адрес: <b>коттеджный посёлок Катина горка</b> <br> Глубина: <b>72 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="коттеджный посёлок Катина горка" data-id="#consultationForm2">Заказать</button>',
        iconContent: "72м",
      },
    },
    {
      id: 515,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.736830", "37.149596"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 78м",
        balloonContentBody:
          'Адрес: <b>село Знаменское</b> <br> Глубина: <b>78 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="село Знаменское" data-id="#consultationForm2">Заказать</button>',
        iconContent: "78м",
      },
    },
    {
      id: 516,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.700817", "37.121537"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 95м",
        balloonContentBody:
          'Адрес: <b>территория Лесной Простор-1, 36</b> <br> Глубина: <b>95 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="территория Лесной Простор-1, 36" data-id="#consultationForm2">Заказать</button>',
        iconContent: "95м",
      },
    },
    {
      id: 517,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.701054", "37.118335"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 90м",
        balloonContentBody:
          'Адрес: <b>Изумрудная улица, 49</b> <br> Глубина: <b>90 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Изумрудная улица, 49" data-id="#consultationForm2">Заказать</button>',
        iconContent: "90м",
      },
    },
    {
      id: 518,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.713684", "37.100355"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 83м",
        balloonContentBody:
          'Адрес: <b>деревня Борки</b> <br> Глубина: <b>83 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="деревня Борки" data-id="#consultationForm2">Заказать</button>',
        iconContent: "83м",
      },
    },
    {
      id: 519,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.728282", "37.102362"],
      },
      properties: {
        iconClass: "orange",
        clusterCaption: "Cкважина 21м",
        balloonContentBody:
          'Адрес: <b>село Уборы, 44</b> <br> Глубина: <b>21 м</b> <br> Статус: <b>Песчаная скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="село Уборы, 44" data-id="#consultationForm2">Заказать</button>',
        iconContent: "21м",
      },
    },
    {
      id: 520,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: ["55.744148", "37.120098"],
      },
      properties: {
        iconClass: "blue",
        clusterCaption: "Cкважина 68м",
        balloonContentBody:
          'Адрес: <b>Полевая улица</b> <br> Глубина: <b>68 м</b> <br> Статус: <b>Артезианская скважина</b> <br><button class="open-modal ya-btn-marker open-modal" data-form="Полевая улица" data-id="#consultationForm2">Заказать</button>',
        iconContent: "68м",
      },
    },
  ];

  ymaps.ready(init_boreholes_map);
  function init_boreholes_map() {
    if (document.getElementById("boreholes_map")) {
      let bmap = new ymaps.Map(
        "boreholes_map",
        {
          center: [55.462994, 37.411216],
          zoom: 11,
          controls: ["mediumMapDefaultSet"],
        },
        { searchControlProvider: "yandex#search" },
      );

      // Создаем собственный макет с ин<button class="open-modal ya-btn-marker open-modal" data-form="Бородино" data-id="#consultationForm2">Заказать</button>цией о выбранном геообъекте.
      let customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
        '<div class="boreholeClasterMarker">{{ properties.balloonContentBody|raw }}</div>',
      );

      let customIconLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="boreholeMapMarker_{{ properties.iconClass|raw }}"><div class="mapMarkerPin"></div><div class="mapMarkerContent">{{ properties.iconContent|raw }}</div></div>',
      );

      let clusterBalloonContentLayoutWidth = 500;
      let clusterBalloonContentLayoutHeight = 170;
      let balloonMaxWidth = 500;

      let bmapObjectManager = new ymaps.ObjectManager({
        clusterize: true,
        gridSize: 32,
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        // Устанавливаем режим открытия балуна.
        // В данном примере балун никогда не будет открываться в режиме панели.
        clusterBalloonPanelMaxMapArea: 0,
        // Устанавливаем размер макета контента балуна (в пикселях).
        clusterBalloonContentLayoutWidth: clusterBalloonContentLayoutWidth,
        clusterBalloonContentLayoutHeight: clusterBalloonContentLayoutHeight,
        // Устанавливаем собственный макет.
        clusterBalloonItemContentLayout: customItemContentLayout,
        // Устанавливаем ширину левой колонки, в которой располагается список всех геообъектов кластера.
        clusterBalloonLeftColumnWidth: 100,

        clusterIconColor: "#0DB25A",
      });

      bmapObjectManager.objects.options.set({
        iconLayout: customIconLayout,
        iconShape: {
          type: "Rectangle",
          coordinates: [
            [0, -30],
            [40, 0],
          ],
        },
      });

      bmap.geoObjects.add(bmapObjectManager);

      bmapObjectManager.add({
        type: "FeatureCollection",
        features: boreholes,
      });
    }
  } // CONCATENATED MODULE: ./src/js/app.js

  // Подключение основного файла стилей

  // Основные модули ========================================================================================================================================================================================================================================================

  /*
Модуль работы со спойлерами
Документация:
Сниппет (HTML): spollers
*/
  spollers();

  /*
Модуль работы с табами
Документация:
Сниппет (HTML): tabs
*/
  tabs();

  /*
Модуль "показать еще"
Документация по работе в шаблоне:
Сниппет (HTML): showmore
*/
  showMore();

  /*
Попапы
Документация по работе в шаблоне:
Сниппет (HTML): pl
*/
  initPopups();

  // Модуль работы с ползунком  ===================================================================================================================================================================================================================================================================================
  /*
Подключение и настройка выполняется в файле js/files/forms/range.js
Документация по работе в шаблоне:
Документация плагина: https://refreshless.com/nouislider/
Сниппет (HTML): range
*/

  /******/
})();
