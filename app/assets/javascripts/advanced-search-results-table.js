function cleanColumnOutput (data, type, row) {
  var unsafeOutputPattern = new RegExp(/>|<|&|"|\/|'/g)
  return data.replace(unsafeOutputPattern, '')
}

$(document).ready(function () {
  var searchQuery = decodeURIComponent(window.location.search)

  if (searchQuery) {
    $('#search-results-header').show()
    $('#advanced-search-results').show()
    var dataReference = '/advanced-search-results' + searchQuery

    $('#advanced-search-results').DataTable({
      processing: true,
      serverSide: true,
      searching: false,
      lengthChange: false,
      order: [],
      ajax: {
        url: dataReference,
        dataSrc: 'claims',
        error: function (response) {
          $('#advanced-search-results_processing').hide()
          alert('An error occurred when searching for claims.') // eslint-disable-line no-undef
        }
      },

      columns: [
        {'data': 'Reference', 'render': cleanColumnOutput},
        {'data': 'Name', 'render': cleanColumnOutput},
        {'data': 'DateSubmittedFormatted'},
        {'data': 'ClaimType',
          'createdCell': function (td, cellData, rowData, row, col) {
            $(td).html('<span class=\'tag ' + rowData.ClaimType + '\'>' + rowData.ClaimTypeDisplayName + '</span>')
          }
        },
        {'data': 'AssignedTo'},
        {'data': 'ClaimId',
          'createdCell': function (td, cellData, rowData, row, col) {
            $(td).html("<a id='claim" + rowData.ClaimId + "' href='/claim/" + rowData.ClaimId + "'>View</a>")
          }
        }
      ],

      columnDefs: [
        {
          'targets': [0, 1, 2, 3, 4],
          'visible': true,
          'searchable': false,
          'orderable': false
        }
      ],

      drawCallback: function () {
        var total = $('#advanced-search-results_info').text().split(' ')[5]
        $('.badge').text(total)
      },

      language: {
        info: 'Showing _START_ to _END_ of _TOTAL_ claims',
        infoEmpty: 'Showing 0 to 0 of 0 claims',
        emptyTable: 'No claims found'
      }
    })
  }
})
