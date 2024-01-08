// Дэлгэцтэй ажиллах controller
var uiController = (function () {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    addBtn: ".add__btn",
    incomeList: ".income__list",
    expenseList: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    containerDiv: ".container",
    expensePercentageLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  var nodeListForeach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  var formatMoney = function (number, type) {
    number = "" + number;
    var x = number.split("").reverse().join("");
    var y = "";
    var count = 1;

    for (var i = 0; i < x.length; i++) {
      y += x[i];
      if (count % 3 === 0 && i !== x.length - 1) y += ",";
      count++;
    }

    var z = y.split("").reverse().join("");

    if (type === "inc") z = "+ " + z;
    else z = "- " + z;

    return z;
  };

  return {
    displayDate: function () {
      var today = new Date();
      document.querySelector(DOMstrings.dateLabel).textContent =
        today.getFullYear() + " оны " + (today.getMonth() + 1) + " сарын";
    },

    changeType: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          ", " +
          DOMstrings.inputDescription +
          ", " +
          DOMstrings.inputValue
      );

      nodeListForeach(fields, function (el) {
        el.classList.toggle("red-focus");
      });

      document.querySelector(DOMstrings.addBtn).classList.toggle("red");
    },

    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // inc, exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseInt(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    displayPercentages: function (allPercentages) {
      // Зарлагын NodeList-ийг олох
      var elements = document.querySelectorAll(
        DOMstrings.expensePercentageLabel
      );

      // Элемент болгоны хувьд зарлагын хувийг массиваас шивж оруулах
      nodeListForeach(elements, function (el, index) {
        el.textContent = allPercentages[index];
      });
    },

    getDOMstrings: function () {
      return DOMstrings;
    },

    clearFields: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );

      // Convert List to Array
      var fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (el, index, array) {
        el.value = "";
      });

      fieldsArr[0].focus();
    },

    showBudget: function (budget) {
      var type = budget.budget > 0 ? "inc" : "exp";
      document.querySelector(DOMstrings.budgetLabel).textContent = formatMoney(
        budget.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatMoney(
        budget.totalInc,
        "inc"
      );
      document.querySelector(DOMstrings.expenseLabel).textContent = formatMoney(
        budget.totalexp,
        "exp"
      );
      if (budget.percent !== 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          budget.percent + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          budget.percent;
      }
    },

    deleteListItem: function (id) {
      var el = document.getElementById(id);
      el.parentNode.removeChild(el);
    },

    addListItem: function (item, type) {
      // Орлого зарлагын элементийг агуулсан html-ийг бэлтгэнэ
      var html, list;
      if (type === "inc") {
        list = DOMstrings.incomeList;
        html =
          '<div class="item clearfix" id="inc-$$id$$"><div class="item__description">$$description$$</div><div class="right clearfix"><div class="item__value">$$value$$</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>';
      } else {
        list = DOMstrings.expenseList;
        html =
          '<div class="item clearfix" id="exp-$$id$$"><div class="item__description">$$description$$</div><div class="right clearfix"><div class="item__value">$$value$$</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Тэр HTML дотроо орлого зарлагын утгуудыг REPLACE хийж өгнө
      html = html.replace("$$id$$", item.id);
      html = html.replace("$$description$$", item.description);
      html = html.replace("$$value$$", formatMoney(item.value, type));

      // Бэлтгэсэн HTML-ээ DOM-руу хийж өгнө
      document.querySelector(list).insertAdjacentHTML("beforeend", html);
    },
  };
})();

// Санхүүтай ажиллах controller
var financeController = (function () {
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = 0;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.items[type].forEach(function (el) {
      sum += el.value;
    });

    data.totals[type] = sum;
  };

  var data = {
    items: {
      inc: [],
      exp: [],
    },

    totals: {
      inc: 0,
      exp: 0,
    },

    budget: 0,

    percent: 0,
  };

  return {
    calculateBudget: function () {
      // Нийт орлогын нийлбэрийг тооцоолно
      calculateTotal("inc");

      // Нийт зарлагын нийлбэрийг тооцоолно
      calculateTotal("exp");

      // Төсвийг тооцоолно
      data.budget = data.totals.inc - data.totals.exp;

      // Орлого зарлагын хувийг тооцоолно
      if (data.totals.inc > 0) {
        data.percent = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percent = 0;
      }
    },

    calculatePercentages: function () {
      data.items.exp.forEach(function (el) {
        el.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPercentages = data.items.exp.map(function (el) {
        return el.getPercentage();
      });

      return allPercentages;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        percent: data.percent,
        totalInc: data.totals.inc,
        totalexp: data.totals.exp,
      };
    },

    deleteItem: function (type, id) {
      var ids = data.items[type].map(function (el) {
        return el.id;
      });

      var index = ids.indexOf(id);

      if (index !== -1) {
        data.items[type].splice(index, 1);
      }
    },

    addItem: function (type, desc, val) {
      var item, id;

      if (data.items[type].length === 0) {
        id = 1;
      } else {
        id = data.items[type][data.items[type].length - 1].id + 1;
      }

      if (type === "inc") {
        item = new Income(id, desc, val);
      } else {
        item = new Expense(id, desc, val);
      }

      data.items[type].push(item);

      return item;
    },
  };
})();

// Програмын холбогч controller
var appController = (function (uiController, financeController) {
  var ctrlAddItem = function () {
    // 1. Оруулах өгөгдлийг дэлгэцээс олж авна
    var input = uiController.getInput();

    if (input.description !== "" && input.value !== "") {
      // 2. Олж авсан өгөгдлүүдээ санхүүгийн controller-т дамжуулж тэнд хадгална
      var item = financeController.addItem(
        input.type,
        input.description,
        input.value
      );
    }

    // 3. Олж авсан өгөгдлүүдээ вэб дээрээ тохирох хэсэгт нь гаргана
    uiController.addListItem(item, input.type);
    uiController.clearFields();

    // Төсвийг шинээр тооцоолоод дэлгэцэнд үзүүлнэ
    updateBudget();
  };

  var updateBudget = function () {
    // 4. Төсвийг тооцоолно
    financeController.calculateBudget();

    // 5. Эцсийн үлдэгдэл, тооцоог дэлгэцэнд гаргана
    var budget = financeController.getBudget();

    // 6. Төсвийн тооцоог дэлгэцэнд гаргана
    uiController.showBudget(budget);

    // 7. Элементүүдийн хувийг тооцоолно
    financeController.calculatePercentages();

    // 8. Элементүүдийн хувийг хүлээж авна
    var allPercentages = financeController.getPercentages();

    // 9. Эдгээр хувийг дэлгэцэнд гаргана
    uiController.displayPercentages(allPercentages);
  };

  var setupEventListeners = function () {
    var DOM = uiController.getDOMstrings();

    document.querySelector(DOM.addBtn).addEventListener("click", function () {
      ctrlAddItem();
    });

    document.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", uiController.changeType);

    document
      .querySelector(DOM.containerDiv)
      .addEventListener("click", function (event) {
        var id = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (id) {
          var arr = id.split("-");
          var type = arr[0];
          var itemId = parseInt(arr[1]);

          // 1. Санхүүгийн модулиас type, id ашиглаад устгана
          financeController.deleteItem(type, itemId);

          // 2. Дэлгэц дээрээс энэ элементийг устгана
          uiController.deleteListItem(id);

          // 3. Үлдэгдэл тооцоог шинэчилж харуулна
          updateBudget();
        }
      });
  };

  return {
    init: function () {
      console.log("Application started...");
      uiController.displayDate();
      uiController.showBudget({
        budget: 0,
        percent: 0,
        totalInc: 0,
        totalexp: 0,
      });
      setupEventListeners();
    },
  };
})(uiController, financeController);

appController.init();
