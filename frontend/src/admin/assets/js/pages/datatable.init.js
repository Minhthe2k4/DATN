export function mountDatatable() {
	const datatableGlobal = window.simpleDatatables
	const tableElement = document.querySelector('#datatable_1')

	if (!datatableGlobal || !tableElement) {
		return () => {}
	}

	const dataTable = new datatableGlobal.DataTable('#datatable_1', {
		searchable: true,
		fixedHeight: false,
	})

	const selectAll = document.querySelector("[name='select-all']")
	const checkboxes = document.querySelectorAll("[name='check']")

	const updateSelectAllState = () => {
		if (!selectAll) {
			return
		}

		const total = checkboxes.length
		const checked = document.querySelectorAll("[name='check']:checked").length

		if (checked <= 0) {
			selectAll.checked = false
			selectAll.indeterminate = false
			return
		}

		if (checked === total) {
			selectAll.checked = true
			selectAll.indeterminate = false
			return
		}

		selectAll.checked = true
		selectAll.indeterminate = true
	}

	const onSelectAllChange = () => {
		if (!selectAll) {
			return
		}

		const checked = selectAll.checked
		checkboxes.forEach((checkbox) => {
			checkbox.checked = checked
		})
	}

	const checkboxHandlers = []

	if (selectAll) {
		selectAll.addEventListener('change', onSelectAllChange)
	}

	checkboxes.forEach((checkbox) => {
		const handler = () => updateSelectAllState()
		checkbox.addEventListener('click', handler)
		checkboxHandlers.push({ checkbox, handler })
	})

	const sorterButton = document.querySelector('.checkbox-all thead tr th:first-child button')
	sorterButton?.classList.remove('datatable-sorter')

	return () => {
		if (selectAll) {
			selectAll.removeEventListener('change', onSelectAllChange)
		}

		checkboxHandlers.forEach(({ checkbox, handler }) => {
			checkbox.removeEventListener('click', handler)
		})

		dataTable.destroy()
	}
}