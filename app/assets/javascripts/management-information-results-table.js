function cleanColumnOutput (data, type, row) {
  const unsafeOutputPattern = />|<|&|"|\/|'/g
  return data.replace(unsafeOutputPattern, '')
}

$(document).ready(function () {
  search = document.getElementById('rawQuery').value
  if (search) {
    search = JSON.parse(search)
  }

  const startSearching = document.getElementById('startSearching').value

  if (startSearching === 'true') {
    // $('#search-results-header').show()
    // $('#claims-received-results').show()
    const dataReference = '/management-information/search'

    $('#claims-received-results').DataTable({
      processing: true,
      serverSide: true,
      searching: false,
      lengthChange: false,
      order: [],
      ajax: {
        url: dataReference,
        type: 'POST',
        data: search,
        dataSrc: 'claims',
        error: function (response) {
          $('#claims-received-results_processing').hide()
          alert('An error occurred when searching for claims.') // eslint-disable-line no-undef
        }
      },
      // 'Claim.Reference', 'Visitor.FirstName', 'Visitor.LastName', 'Claim.DateSubmitted', 'Claim.ClaimId', 'Claim.Status'
      columns: [
        { data: 'Reference', render: cleanColumnOutput },
        { data: 'Claimant', render: cleanColumnOutput },

        { data: 'AssignedTo', render: cleanColumnOutput },

        { data: 'DateSubmittedFormatted' },
        { data: 'ClaimId' },
        { data: 'DisplayStatus' },
        {
          data: 'ClaimId',
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).html("<a id='claim" + rowData.ClaimId + "' href='/claim/" + rowData.ClaimId + "'>View</a>")
          }
        }
      ],

      columnDefs: [
        {
          targets: [0, 1, 2, 3, 4, 5, 6],
          visible: true,
          searchable: false,
          orderable: false,
          createdCell: function (td, cellData, rowData, row, col) {
            $(td).css('padding', '10px')
          }
        }
      ],

      drawCallback: function () {
        const total = $('#claims-received-results_info').text().split(' ')[6]
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
