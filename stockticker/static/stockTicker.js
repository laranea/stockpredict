// stockTicker.js:
// Holds methods and fields used for processing ticker data
// for the stockTicker app

var stockTicker = {

    _tickers: null,
    _numTickers: 0,
    // incremental counter, used to uniquely identify a set of ticker requests
    _overallCounter: 0,
    _results: null,
    _portfolioQueryUrl: null,
    _dates: null,
    _portfolioPrices: null,
    _showPortfolio: true,

    _divIdForTicker: function(ticker) {
	// Returns the div identifier used to hold results for a single ticker
	return 'result-' + ticker + '-' + this._overallCounter;
    },
    _divIdForPortfolio: function() {
	// Return sthe div identifier used to hold results for the portfolio
	return 'portfolio-result-' + this._overalCounter;
    },
    tickerQueryCallback: function(data) {
	// Callback to handle the data returned form a server for a single
	// ticker
	if (data.counter !== stockTicker._overallCounter) { return; }
	$('#' + stockTicker._divIdForTicker(data.ticker)).html(data.div);
	$('head').append(data.script);
	
	stockTicker._processResults(data.ticker, data.partialResults);
    },
    _processResults: function(ticker, partialResults) {
	// Do further processing of the results returned for a single ticker
	// Adds the prices to the prices for the entire portfolio
	if (!stockTicker._showPortfolio) { return; }
	stockTicker._results[ticker] = partialResults;

	var i;
	var weight = stockTicker._tickers[ticker].weight;

	if (!stockTicker._dates) {
	    stockTicker._dates = partialResults.dates;
	    stockTicker._portfolioPrices = [];
	    for (i = 0; i < stockTicker._dates.length; i++) {
		stockTicker._portfolioPrices[i] = weight*partialResults.prices[i];
	    }
	}
	else {
	    for (i = 0; i < stockTicker._dates.length; i++) {
		stockTicker._portfolioPrices[i] += weight*partialResults.prices[i];
	    }
	}

	// Do some final processing when all data has been received
	if (Object.keys(stockTicker._results).length === stockTicker._numTickers) {
	    stockTicker._getPortfolioResults();
	}
    },
    _getPortfolioResults: function() {
	// Send the portfolio value to the server to get a
	// graph

	// Use a POST request since there may be too much data for a GET request.
	$.post(stockTicker._portfolioQueryUrl,
	       {dates: stockTicker._dates.toString(),
		prices: stockTicker._portfolioPrices.toString(),
	        counter: stockTicker._overallCounter },
	       stockTicker.portfolioQueryCallback, 'json');
    },
    portfolioQueryCallback: function(data) {
	// Callback called after the server returns the visualization for the
	// the portfolio

	if (data.counter !== stockTicker._overallCounter) { return; }
	$('#' + stockTicker._divIdForPortfolio()).html(data.div);
	$('head').append(data.script);
    },
    processTickers: function(showPortfolio, tickers, tickerQueryUrl, portfolioQueryUrl) {
	// Main entry point. Takes the list of tickers, and makes some HTTP requests
	// for the data

	this._overallCounter += 1;
	this._tickers = {};
	this._numTickers = Object.keys(tickers).length;
	this._results = results;
	this._portfolioQueryUrl = portfolioQueryUrl;
	this._dates = null;
	this._prices = null;
	this._showPortfolio = showPortfolio;

	var innerHtml = "";

	if (this._showPortfolio) {
	    innerHtml += '<h3>Portfolio</h3><div id="' + 
		this._divIdForPortfolio() + 
		'">Loading...</div>';
	}

	var i;
	for (i = 0; i < tickers.length; i++)
	{
	    ticker = tickers[i].ticker;
	    this._tickers[ticker] = tickers[i];
	    innerHtml += '<h3>' + ticker + '</h3>';
	    innerHtml += '<div id="' + this._divIdForTicker(ticker) +
		'">Loading...</div>';
	    $.getJSON(tickerQueryUrl, { ticker: ticker, counter: this._overallCounter },
		      this.tickerQueryCallback);		      
	}
	$('#results').html(innerHtml);
    }
};	    
	    
