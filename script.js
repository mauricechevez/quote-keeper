/* ⚡⚡⚡ Storage Controller ⚡⚡⚡ */
const StorageCtrl = (function() {

  // Public Functions
  return {
    storeItem: function(quote) {
      let quotes;
      // Check if items exist in LS
      if (localStorage.getItem('quotes') === null) {
        // Create an empty array to fill with quotes
        quotes = [];
        // Push the quote to the array
        quotes.push(quote)
        // Send array to LocalStorage
        localStorage.setItem('quotes', JSON.stringify(quotes))
      } else {
        // Get what exists inside of LS
        quotes = JSON.parse(localStorage.getItem('quotes'))
        // Push the quote to the array
        quotes.push(quote)
        // Send array to LocalStorage
        localStorage.setItem('quotes', JSON.stringify(quotes))
      }
    },
    updateStorageItem: function(quote) {
      // Get quotes from LS
      let quotes = JSON.parse(localStorage.getItem('quotes'))
      quotes.forEach((q, index) => {
        if (q.id === quote.id) {
          quotes.splice(index, 1, quote)
        }
      })
      // Send to LS
      localStorage.setItem('quotes', JSON.stringify(quotes))
    },
    deleteStorageItem: function(id) {
      // Get quotes from LS
      let quotes = JSON.parse(localStorage.getItem('quotes'))
      quotes.forEach((q, index) => {
        if (q.id === id) {
          quotes.splice(index, 1)
        }
      })
      // Send to LS
      localStorage.setItem('quotes', JSON.stringify(quotes))
    },
    clearLocalStorage: function() {
      localStorage.clear();
    },
    getStorageItems: function() {
      let quotes;
      if (localStorage.getItem("quotes") === null) {
        quotes = []
      } else {
        quotes = JSON.parse(localStorage.getItem("quotes"));
      }
      return quotes;
    },
    storeSortValue: function(value) {
      localStorage.setItem("sortValue", value)
    },
    getSortValueLS: function() {
      let storedSortValue;
      if (localStorage.getItem("sortValue") === null) {
        storedSortValue = "descending"
      } else {
        storedSortValue = localStorage.getItem("sortValue")
      }
      return storedSortValue;
    }
  }
})()

/* ⚡⚡⚡ Data Controller ⚡⚡⚡ */
const DataCtrl = (function() {

  // 🛠 Object constructor 🛠
  const Quote = function(id, text, author, createdDate) {
    this.id = id;
    this.text = text;
    this.author = author;
    this.createdDate = createdDate;
  }

  const data = {
    quotes: StorageCtrl.getStorageItems(),
    currentQuote: null,
    submitState: true
  }

  const sortValue = StorageCtrl.getSortValueLS();

  // 🗝️ PRIVATE Functions 🗝️
  const getDate = function() {
    const date = new Date()
    return date;
  }

  // 👨‍💻 PUBLIC Methods 👨‍💻
  return {
    getSortValue: function() {
      return sortValue;
    },
    getAllQuotes: function() {
      return data.quotes;
    },
    addQuote: function(quote, author) {
      let ID;
      if (data.quotes.length > 0) {
        ID = data.quotes[data.quotes.length - 1].id + 1;
      } else {
        ID = 0;
      }
      // Get today's date
      const todaysDate = getDate();

      // Create new object with quote data in seconds (unix time stamp)
      const newQuote = new Quote(ID, quote, author, todaysDate.getTime())
      // Add quote to the data array
      data.quotes.push(newQuote)
      return newQuote;
    },
    getQuoteById: function(id) {
      let match = null;
      // Iterate through each item in the data structure for an ID match
      data.quotes.forEach(quote => {
        if (quote.id === id) {
          match = quote;
        }
      })
      return match;
    },
    getCurrentQuote: function() {
      return data.currentQuote;
    },
    setCurrentQuote: function(quote) {
      data.currentQuote = quote;
    },
    updateCurrentQuote: function(quoteText, quoteAuthor) {
      // setup a placeholder for found object
      let found = null;
      /* Look for a match of the data based on the current item
        * when found, replace the text of that object with the new text
        from the text being passed in as a parameter
      */
      data.quotes.forEach(q => {
        if (q.id === data.currentQuote.id) {
          q.text = quoteText;
          q.author = quoteAuthor;
          found = q;
        }// end if
      })
      return found;
    },
    deleteCurrentQuote: function(id) {
      // Create a new array of ids based on the original data
      const quoteIds = data.quotes.map(function(quote) {
        return quote.id
      })
      // Compare IDs by using indexOf() method
      const result = quoteIds.indexOf(id);
      // We now have the correct index of the quote we need to remove from the array
      data.quotes.splice(result, 1)

      /*** My way of doing it below, but probably not as effecient in the long run. ***/
      // let id = quote.id;
      // // Iterate through all quotes and match the ID
      // data.quotes.forEach((q,index) =>{
      //   if(q.id === quote.id){
      //     data.quotes.splice(index,1)
      //   }
      // })
      // console.log(data.quotes)
    },
    getSubmitStatevalue: function() {
      return data.submitState;
    },
    setSubmitStateValue: function(value) {
      data.submitState = value;
    },
    removeAllQuotes: function() {
      data.quotes = [];
    },
    getQuoteTotalAmount: function() {
      return data.quotes.length;
    },
    getCurrentDate: function() {
      const today = new Date()
      return today;
    },
    getSampleQuote:async function(url){
      const resp = await fetch(
        url,
        {method: 'GET'}
      );
      if(!resp.ok){
        throw new Error(`Error! status: ${resp.status}`)
      }
      const data = await resp.json();
      // console.log(data)
      return data;
    },
    logData: function() {
      return data
    }
  }

})()

/* ⚡⚡⚡  UI Controller ⚡⚡⚡ */
const UICtrl = (function() {

  // 🗝️ PRIVATE Functions 🗝️
  // Selectors for the UI
  const UISelectors = {
    addQuote: '#add-quote-btn',
    quoteInput: '#quote',
    authorName: '#author',
    quoteList: '#quote-list',
    quoteListHeader: '#quote-list-header',
    quoteListItem: '.list-quote-text',
    quoteInfoContainer: '#quote-info-container',
    editBtn: '#edit-btn',
    deleteBtn: '#delete-btn',
    backBtn: '#back-btn',
    clearBtn: '#clear-btn',
    editStateBtns: '.edit-state-btns',
    fieldWrapper: '.field-wrapper',
    sortField: '#sort-field',
    sampleQuotesLinkContainer: '#sample-quotes-link-container'
  }
  function compareDates(a, b) {
    if (b.createdDate < a.createdDate) {
      return -1;
    }
    if (b.createdDate > a.createdDate) {
      return 1;
    }
    return 0;
  }

  // 👨‍💻 PUBLIC Functions 👨‍💻
  return {
    getSelectors: function() {
      return UISelectors;
    },
    getQuoteInput: function() {
      // Grab the values, and use trim method to prevent adding spaces in begginning and end of value, and prevent empties from being added to Storage.
      return {
        quote: document.querySelector(UISelectors.quoteInput).value.trim(),
        author: document.querySelector(UISelectors.authorName).value.trim()
      }
    },
    populateListItemsWithQuotes: function(quotes, sortValue) {
      // const sortValue = document.querySelector(UISelectors.sortField).value;
      let html = "";
      // Sort based on sort value
      if (sortValue == "descending") {
        // Make new array for sorting
        const quotesDesc = quotes.map(q => (
          { id: q.id, text: q.text, author: q.author, createdDate: new Date(q.createdDate).toLocaleString() }
        ))
        // Sort them in Descending order
        quotesDesc.sort(compareDates);
        // Run a forEach on each quote
        quotesDesc.forEach(quote => {
          // Make new Date variable for stored creation date
          const localeDate = new Date(quote.createdDate)
          html += `<div class="quote-wrapper"><li class="list-quote-text" id="item-${quote.id}"><span><em>${quote.text}</em> - by: <strong>${quote.author}</strong></span> <a href="#" class="secondary-content"><i class="edit-item fa fa-pencil"></i></a></li><span class="date">Added: ${localeDate.toLocaleString()}</span></div>`
        })
      } else {
        // These are assorted in Ascending order
        quotes.forEach(quote => {
          // Make new Date variable for stored creation date
          const localeDate = new Date(quote.createdDate)
          html += `<div class="quote-wrapper"><li class="list-quote-text" id="item-${quote.id}"><span><em>${quote.text}</em> - by: <strong>${quote.author}</strong></span> <a href="#" class="secondary-content"><i class="edit-item fa fa-pencil"></i></a></li><span class="date">Added: ${localeDate.toLocaleString()}</span></div>`
        })
      }
      // // Insert the new list items into the UL
      document.querySelector(UISelectors.quoteList).innerHTML = html;
    },
    addListItem: function(quote, sortValue) {
      // Make new Date variable for stored creation date
      const localeDate = new Date(quote.createdDate)

      // Create new Div for quote wrapper
      const div = document.createElement('div');
      div.className = 'quote-wrapper';

      // Add the innerHTML to the div
      div.innerHTML = `<li class="list-quote-text" id="item-${quote.id}"><span><em>${quote.text}</em> - by: <strong>${quote.author}</strong></span> <a href="#" class="secondary-content"><i class="edit-item fa fa-pencil"></i></a></li><span class="date">Added: ${localeDate.toLocaleString()}</span>`

      // Add to the list container - depending on sort value
      document.querySelector(UISelectors.quoteList).insertAdjacentElement(`${sortValue}`, div)

    },
    clearInput: function() {
      document.querySelector(UISelectors.quoteInput).value = "";
      document.querySelector(UISelectors.authorName).value = "";
      document.querySelector(UISelectors.quoteInput).focus();
    },
    clearEditState: function() {
      document.querySelector(UISelectors.editStateBtns).style.display = 'none';
      document.querySelector(UISelectors.addQuote).style.display = 'block';
      UICtrl.clearInput();
    },
    showEditState: function() {
      document.querySelector(UISelectors.editStateBtns).style.display = 'block';
      document.querySelector(UISelectors.addQuote).style.display = 'none';
    },
    addQuoteToForm: function() {
      const currentQuote = DataCtrl.getCurrentQuote();
      // Add all quote values back to the form inputs
      document.querySelector(UISelectors.quoteInput).value = currentQuote.text;
      document.querySelector(UISelectors.authorName).value = currentQuote.author;
    },
    updateQuoteList: function(updatedQuote) {
      // Match the ID of the list item element with the object id.
      const listItems = document.querySelectorAll(UISelectors.quoteListItem);
      /* Compare the ID from the updatedQuote param to the ID of the LI element.
        Do this FOREACH list item in the UL!
      */
      listItems.forEach(li => {
        const listID = li.getAttribute('id');
        if (listID === `item-${updatedQuote.id}`) {
          // Replace the innerHTML with the new text
          document.querySelector(`#${listID}`).innerHTML = `
          <span><em>${updatedQuote.text}</em> - by: <strong>${updatedQuote.author}</strong></span> <a href="#" class="secondary-content"><i class="edit-item fa fa-pencil"></i></a>
          `
        }
      })
    },
    deleteQuoteUI: function(id) {
      let element = `item-${id}`
      // document.getElementById(element).remove()
      document.getElementById(element).parentElement.remove();
    },
    removeAllQuotesFromUI: function() {
      let listItems = document.querySelectorAll(UISelectors.quoteListItem);
      listItems.forEach(li => {
        li.parentElement.remove()
      })
    },
    updateTotalQuotesUI: function() {
      const totalQuotes = DataCtrl.getQuoteTotalAmount();
      document.getElementById('total-quotes').innerHTML = `${totalQuotes}`
    },
    hideList: function() {
      document.querySelector(UISelectors.quoteInfoContainer).style.display = 'none';
      document.querySelector(UISelectors.quoteList).style.display = 'none';
    },
    showList: function() {
      document.querySelector(UISelectors.quoteInfoContainer).style.display = 'flex';
      document.querySelector(UISelectors.quoteList).style.display = 'block';
    },
    displayFieldErrorMsg: function(message, indexNum) {
      // Create the error message element
      const span = document.createElement('span');
      span.className = 'err-msg';
      span.textContent = `Requirement missing: ${message}`;
      // Get all field wrappers
      const fieldWrappers = document.querySelectorAll(UISelectors.fieldWrapper);
      // Insert the error message element after the correct inputfield
      fieldWrappers[indexNum].insertAdjacentElement("beforeend", span);
    },
    removeFieldErrorMsg: function() {
      if (document.querySelector('.err-msg')) {
        const allErrors = document.querySelectorAll('.err-msg');
        allErrors.forEach(err => {
          err.remove()
        })
      }
    },
    toggleClearBtnState(toggle) {
      if (toggle == "true") {
        document.querySelector(UISelectors.clearBtn).disabled = `${toggle}`;
        document.querySelector(UISelectors.clearBtn).classList.add("disabled")

      } else if (toggle == "false") {
        document.querySelector(UISelectors.clearBtn).removeAttribute("disabled")
        document.querySelector(UISelectors.clearBtn).classList.remove("disabled")
      } else {
        console.error(`${toggle} is not a valid toggle state for the Clear All button`)
      }
    },
    getSortValueUI: function() {
      const sortBy = document.querySelector(UISelectors.sortField).value;
      if (sortBy == "descending") {
        return 'afterbegin'
      } else if (sortBy == "ascending") {
        return 'beforeend'
      }
    },
    setSortValueUI: function(value) {
      const sortByField = document.querySelector(UISelectors.sortField)
      const children = Array.from(sortByField.children)
      children.forEach(child => {
        child.removeAttribute("selected")
        if (child.value == value) {
          child.setAttribute("selected", "")
        }
      })
    },
    resetSortValueUI: function() {
      const sortByField = document.querySelector(UISelectors.sortField)
      const children = Array.from(sortByField)
      // remove any selected value
      children.forEach(child => {
        child.removeAttribute("selected")
      })
      // Set default to descending
      children[0].setAttribute("selected", "")
    }
  }
})()

/* ⚡⚡⚡ App Controller ⚡⚡⚡ */
const AppCtrl = (function(StorageCtrl, DataCtrl, UICtrl) {
  // Get list of all selectors
  const uiSelectors = UICtrl.getSelectors();

  // Sample Quotes
  const sampleQuotes = [
    {
      quote: "Life is what happens when you're busy making other plans",
      author: "John Lennon"
    },
    {
      quote: "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
      author: "Benjamin Franklin"
    },
    {
      quote:"If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough",
      author:"Oprah Winfrey"
    },
    {
      quote:"The way to get started is to quit talking and begin doing",
      author:"Walt Disney"
    },
    {
     quote:"The future belongs to those who believe in the beauty of their dreams",
      author:"Eleanor Roosevelt"
    }
  ]

  // 👂 Event Listeners 👂
  const loadEventListener = function() {
    document.querySelector(uiSelectors.addQuote).addEventListener('click', quoteAddSubmit)
    document.querySelector(uiSelectors.quoteList).addEventListener('click', quoteEditClick)
    document.querySelector(uiSelectors.editBtn).addEventListener('click', quoteEditSubmit)
    document.querySelector(uiSelectors.backBtn).addEventListener('click', backBtnClick)
    document.querySelector(uiSelectors.deleteBtn).addEventListener('click', quoteDeleteSubmit)
    document.querySelector(uiSelectors.clearBtn).addEventListener('click', clearAllQuotes)
    document.querySelector(uiSelectors.sortField).addEventListener('change', sortQuoteList)
    document.querySelector(uiSelectors.sampleQuotesLinkContainer).addEventListener('click',addSampleQuote)
    // document.querySelector(uiSelectors.sampleQuotesLinkContainer).add
    /* ⌨️ PREVENT Enter Key from being used to submit the form ⌨️ */
    document.addEventListener('keypress', function(e) {
      const submitStateValue = DataCtrl.getSubmitStatevalue()
      if (submitStateValue === false) {
        // 🪺 NESTED IF 🪺
        if (e.keyCode == 13 || e.which === 13) {
          e.preventDefault();
          return false;
        }
      }
    })
  }

  /* 🗝️ Private Functions 🗝️ */

  // 👇 Add -- Submit quote 👇
  const quoteAddSubmit = function(e) {
    const input = UICtrl.getQuoteInput();
    // Check for a quote information
    if (input.quote != "" && input.author != "") {
      // Show the list
      UICtrl.showList()
      // Toggle Clear Button state
      UICtrl.toggleClearBtnState("false")
      // Add the quote to the Data Controller
      const newQuote = DataCtrl.addQuote(input.quote, input.author)
      // Get Sort Direction
      const sortValue = UICtrl.getSortValueUI()
      // Add quote to the UI
      UICtrl.addListItem(newQuote, sortValue)
      // Add quote to local Storage
      StorageCtrl.storeItem(newQuote)
      // Show total quotes on screen
      UICtrl.updateTotalQuotesUI()
      // Clear the input
      UICtrl.clearInput()
      // Check for error messages
      UICtrl.removeFieldErrorMsg()
      // Hide random quote link generator
    document.querySelector(uiSelectors.sampleQuotesLinkContainer).style.display = 'none';
    } else if (input.quote == "" && input.author == "") {
      // Check for error messages and get rid of them first
      UICtrl.removeFieldErrorMsg()
      // Handle if all fields are missing
      UICtrl.displayFieldErrorMsg("quote text", 0);
      UICtrl.displayFieldErrorMsg("author name", 1);
    } else if (input.quote == "") {
      // Check for error messages
      UICtrl.removeFieldErrorMsg()
      // Handle if quote text is missing
      UICtrl.displayFieldErrorMsg("quote text", 0);
    } else if (input.author == "") {
      // Check for error messages
      UICtrl.removeFieldErrorMsg()
      // Handle if author text is missing
      UICtrl.displayFieldErrorMsg("author name", 1)
    } else { console.log('missing input') }

    e.preventDefault()
  }
  // 👇 ✏ Click on Edit Pencil icon ✏ 👇
  const quoteEditClick = function(e) {
    // Check for error messages
    UICtrl.removeFieldErrorMsg()
    // Focus on the quote text field
    document.querySelector(uiSelectors.quoteInput).focus();

    if (e.target.classList.contains('edit-item')) {
      // Get the ID of the quote
      const quoteID = e.target.parentNode.parentNode.id;

      console.log(quoteID)
      const splitArray = quoteID.split('-');
      // get the ID from the array
      const id = parseInt(splitArray[1]);
      // get Quote from the data structure
      const quoteToEdit = DataCtrl.getQuoteById(id)
      // Set current Item/Quote
      DataCtrl.setCurrentQuote(quoteToEdit)

      // Add Item to the form
      UICtrl.addQuoteToForm();

      // Show Edit State
      UICtrl.showEditState()

      // Set SubmitState value
      DataCtrl.setSubmitStateValue(false)
    }
    e.preventDefault()
  }
  /* 👇 Update -- Edit Quote Submit function 👇 */
  const quoteEditSubmit = function(e) {
    // const textInput = document.querySelector(uiSelectors.quoteInput);
    // const authorInput = document.querySelector(uiSelectors.authorName);
    const input = UICtrl.getQuoteInput();

    if (input.quote != "" && input.author != "") {
      // Insert input into currentQuote value
      const updatedQuote = DataCtrl.updateCurrentQuote(input.quote, input.author);

      // Update the quote in LS
      StorageCtrl.updateStorageItem(updatedQuote)

      // Clear Edit State
      UICtrl.clearEditState()

      // Set SubmitState value
      DataCtrl.setSubmitStateValue(true)

      // Update the UI to reflect the change to data structure
      UICtrl.updateQuoteList(updatedQuote)

      // Show total quotes on screen
      UICtrl.updateTotalQuotesUI()
    } else if (input.quote == "" && input.author == "") {
      UICtrl.removeFieldErrorMsg()
      UICtrl.displayFieldErrorMsg("quote text", 0);
      UICtrl.displayFieldErrorMsg("author name", 1);
    } else if (input.quote == "") {
      UICtrl.removeFieldErrorMsg()
      UICtrl.displayFieldErrorMsg("quote text", 0);
    } else if (input.author == "") {
      UICtrl.removeFieldErrorMsg()
      UICtrl.displayFieldErrorMsg("author text", 1);
    } else {
      console.error("UPDATE Function - missing info?")
    }
    e.preventDefault()
  }

  /* 👇 Delete Quote Submit function 👇 */
  const quoteDeleteSubmit = function(e) {
    // Remove any error messages
    UICtrl.removeFieldErrorMsg()

    // get current quote
    let currentQuote = DataCtrl.getCurrentQuote()

    // Delete from the Data Structure
    DataCtrl.deleteCurrentQuote(currentQuote.id)

    // Delete from Storage
    StorageCtrl.deleteStorageItem(currentQuote.id)

    // Delete from UI using the ID of the quote item
    UICtrl.deleteQuoteUI(currentQuote.id)

    // Set SubmitState value
    DataCtrl.setSubmitStateValue(true)

    // Show total quotes on screen
    UICtrl.updateTotalQuotesUI()

    // Back to Submit state
    UICtrl.clearEditState()

    // Remove the list of quotes if condition is met
    const totalQuotes = DataCtrl.getQuoteTotalAmount()
    if (totalQuotes === 0) {
      UICtrl.hideList()
      // Disable the Clear All Button
      UICtrl.toggleClearBtnState("true");
      // Show random quote link generator
    document.querySelector(uiSelectors.sampleQuotesLinkContainer).style.display = 'block';
    }
    e.preventDefault()
  }

  /* 🔙 Click on the Back Button 🔙 */
  const backBtnClick = function(e) {
    // Remove any error messages
    UICtrl.removeFieldErrorMsg()

    // Clear the edit state
    UICtrl.clearEditState()

    // Set SubmitState value
    DataCtrl.setSubmitStateValue(true)

    e.preventDefault;
  }

  /* 👇 Clear All Quotes 👇 */
  const clearAllQuotes = function(e) {
    // Check with user
    if (confirm('Are you sure you want to clear all quotes?')) {
      // Remove all quotes from the Data Structure
      DataCtrl.removeAllQuotes()

      // Clear localStorage
      StorageCtrl.clearLocalStorage();

      // Remove all quotes from the UI
      UICtrl.removeAllQuotesFromUI();

      // Hide the list
      UICtrl.hideList();

      // Disable the Clear All Button
      UICtrl.toggleClearBtnState("true");

      // Set Submit State to true
      DataCtrl.setSubmitStateValue(true);

      // Show total quotes on screen
      UICtrl.updateTotalQuotesUI()

      // Remove any error messages
      UICtrl.removeFieldErrorMsg()

      // Reset Sort By Value
      UICtrl.resetSortValueUI()

      // Back to Submit state
      UICtrl.clearEditState();

      // Show random quote link generator
    document.querySelector(uiSelectors.sampleQuotesLinkContainer).style.display = 'block';

    }
    e.preventDefault();
  }
  /* 👇  Sort Quote List 👇 */
  const sortQuoteList = function(e) {
    const sortByValue = e.target.value;
    // Write the sort value to LS
    StorageCtrl.storeSortValue(sortByValue);
    const allQuotes = DataCtrl.getAllQuotes();
    console.log(allQuotes)
    UICtrl.populateListItemsWithQuotes(allQuotes, sortByValue);
  }

  // 👇 Add -- SAMPLE quotes 👇
  const addSampleQuote = function(e) {
    DataCtrl.getSampleQuote('./sample-quotes.json')
    .then(data => data.sampleQuotes)
      // Send objects down
    .then(newData => {
      // Show the list
    UICtrl.showList()
      // Toggle Clear Button state
    UICtrl.toggleClearBtnState("false")
      // Pick random quote from SampleQuotes array
      const randomNum = Math.floor(Math.random() * 10);
      const sampleQuote = newData[randomNum];    
      // Add quote to the DataCtrl
      const newQuote = DataCtrl.addQuote(sampleQuote.quote, sampleQuote.author)
      // Add quote to the UI
      UICtrl.addListItem(newQuote, "afterbegin")
      // Add quote to local Storage
      StorageCtrl.storeItem(newQuote)
          // Show total quotes on screen
      UICtrl.updateTotalQuotesUI()
      // Clear the input
      UICtrl.clearInput()
      // Check for error messages
      UICtrl.removeFieldErrorMsg()
      // Hide random quote link generator
      document.querySelector(uiSelectors.sampleQuotesLinkContainer).style.display = 'none';
      e.preventDefault;
    }
  );

  }

  // 👨‍💻 PUBLIC Methods 👨‍💻
  return {
    init: function() {
      // Hide buttons in UI
      UICtrl.clearEditState();

      // Get Sort By Value from LS
      const sortValue = DataCtrl.getSortValue();
      // Set Sort Value on the UI on LOAD only
      UICtrl.setSortValueUI(sortValue)
      // Get all quotes, display on screen/UI
      const allStoredQuotes = DataCtrl.getAllQuotes();
      if (allStoredQuotes.length === 0) {
        // Disable the Clear button
        UICtrl.toggleClearBtnState("true");
        UICtrl.hideList();
      } else {
        // Display total number of quotes
        UICtrl.updateTotalQuotesUI()
        UICtrl.populateListItemsWithQuotes(allStoredQuotes, sortValue)
        UICtrl.toggleClearBtnState("false");
        // Hide random quote link generator
      document.querySelector(uiSelectors.sampleQuotesLinkContainer).style.display = 'none';
      }

      // Load Event Listeners
      loadEventListener();
    },
    runSampleQuotes: function() {
      return addSampleQuote();
    }
  }
})(StorageCtrl, DataCtrl, UICtrl)

// Load the App init function
AppCtrl.init()