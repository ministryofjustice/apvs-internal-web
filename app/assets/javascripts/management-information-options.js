$(document).ready(function () {
  populateMetrics()
  populateBreakdownBy()

  search = document.getElementById('rawQuery').value
  if (search) {
    search = JSON.parse(search)
  }

  $('#breakdownBy').change(function () {
    populateBreakdownBy()
  })

  $('.date-input').change(function () {
    const breakdownBy = $('#breakdownBy').val()
    if (breakdownBy === 'year') {
      populateYears()
    }
    if (breakdownBy === 'month') {
      populateMonths()
    }

    if (breakdownBy === 'quarter') {
      populateQuarters()
    }

    if (breakdownBy === 'week') {
      populateWeeks()
    }
  })

  $('#metric').change(function () {
    populateMetrics()
  })
})

function populateYears () {
  const fromDay = $('#fromDay').val()
  const fromMonth = $('#fromMonth').val()
  const fromYear = $('#fromYear').val()
  const toDay = $('#toDay').val()
  const toMonth = $('#toMonth').val()
  const toYear = $('#toYear').val()

  try {
    const fromDate = moment(fromYear + '-' + fromMonth + '-' + fromDay)
    const toDate = moment(toYear + '-' + toMonth + '-' + toDay)

    if (toDate.isSameOrAfter(fromDate)) {
      $('#year').empty()
        .append('<option value="select" disabled selected>Select</option>')
      const now = fromDate.clone().startOf('year')
      let search = document.getElementById('rawQuery').value
      if (search) {
        search = JSON.parse(search)
      }
      while (now.isSameOrBefore(toDate)) {
        if (now.year() >= 2017) {
          const yearValue = now.clone().format('YYYY-MM-DD') + ',' + now.clone().endOf('year').format('YYYY-MM-DD')

          if (search) {
            if (search.year === yearValue) {
              $('#year').append('<option value="' + yearValue + '" selected>' + now.clone().format('YYYY') + '</option>')
            } else {
              $('#year').append('<option value="' + yearValue + '">' + now.clone().format('YYYY') + '</option>')
            }
          }
        }
        now.add(1, 'year')
      }
    }
  } catch (error) {
    console.error(error)
  }
}

function populateMonths () {
  const fromDay = $('#fromDay').val()
  const fromMonth = $('#fromMonth').val()
  const fromYear = $('#fromYear').val()
  const toDay = $('#toDay').val()
  const toMonth = $('#toMonth').val()
  const toYear = $('#toYear').val()

  try {
    const fromDate = moment(fromYear + '-' + fromMonth + '-' + fromDay)
    const toDate = moment(toYear + '-' + toMonth + '-' + toDay)

    if (toDate.isSameOrAfter(fromDate)) {
      $('#month').empty()
        .append('<option value="select" disabled selected>Select</option>')
      const now = fromDate.clone().startOf('month')
      while (now.isSameOrBefore(toDate)) {
        if (now.year() >= 2017) {
          $('#month').append(new Option(
            now.clone().format('MMM') + ' ' + now.clone().format('YYYY'),
            now.clone().format('YYYY-MM-DD') + ',' + now.clone().endOf('month').format('YYYY-MM-DD')
          ))
        }
        now.add(1, 'month')
      }
    }
  } catch (error) {
    console.error(error)
  }
}

function populateQuarters () {
  const fromDay = $('#fromDay').val()
  const fromMonth = $('#fromMonth').val()
  const fromYear = $('#fromYear').val()
  const toDay = $('#toDay').val()
  const toMonth = $('#toMonth').val()
  const toYear = $('#toYear').val()

  try {
    const fromDate = moment(fromYear + '-' + fromMonth + '-' + fromDay)
    const toDate = moment(toYear + '-' + toMonth + '-' + toDay)

    if (toDate.isSameOrAfter(fromDate)) {
      $('#quarter').empty()
        .append('<option value="select" disabled selected>Select</option>')
      const now = fromDate.clone().startOf('quarter')
      while (now.isSameOrBefore(toDate)) {
        if (now.year() >= 2017) {
          $('#quarter').append(new Option(
            'Q' + now.clone().quarter() + ' ' + now.clone().format('YYYY'),
            now.clone().format('YYYY-MM-DD') + ',' + now.clone().endOf('quarter').format('YYYY-MM-DD')
          ))
        }
        now.add(1, 'quarter')
      }
    }
  } catch (error) {
    console.error(error)
  }
}

function populateWeeks () {
  const fromDay = $('#fromDay').val()
  const fromMonth = $('#fromMonth').val()
  const fromYear = $('#fromYear').val()
  const toDay = $('#toDay').val()
  const toMonth = $('#toMonth').val()
  const toYear = $('#toYear').val()

  try {
    const fromDate = moment(fromYear + '-' + fromMonth + '-' + fromDay)
    const toDate = moment(toYear + '-' + toMonth + '-' + toDay)

    if (toDate.isSameOrAfter(fromDate)) {
      $('#week').empty()
        .append('<option value="select" disabled selected>Select</option>')
      const now = fromDate.clone().startOf('week').add(1, 'day')
      while (now.isSameOrBefore(toDate)) {
        if (now.year() >= 2017) {
          $('#week').append(new Option(
            now.clone().format('DD-MM-YYYY') + ' - ' + now.clone().endOf('week').add(1, 'day').format('DD-MM-YYYY'),
            now.clone().format('YYYY-MM-DD') + ',' + now.clone().endOf('week').add(1, 'day').format('YYYY-MM-DD')
          ))
        }
        now.add(1, 'week')
      }
    }
  } catch (error) {
    console.error(error)
  }
}

function populateMetrics () {
  const metric = $('#metric').val()
  if (metric === 'pending') {
    $('#pendingReasonDiv').show()
  } else {
    $('#pendingReasonDiv').hide()
  }
}

function populateBreakdownBy () {
  const breakdownBy = $('#breakdownBy').val()
  $('.breakdownByDivs').hide()
  if (breakdownBy === 'year') {
    $('#yearDiv').show()
    populateYears()
  }
  if (breakdownBy === 'month') {
    $('#monthDiv').show()
    populateMonths()
  }
  if (breakdownBy === 'quarter') {
    $('#quarterDiv').show()
    populateQuarters()
  }
  if (breakdownBy === 'week') {
    $('#weekDiv').show()
    populateWeeks()
  }
}
