/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import { toHaveClass } from "@testing-library/jest-dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import userEvent from '@testing-library/user-event'
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const billsPage = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      document.body.innerHTML = BillsUI({data: [bills[0]]})
  })

  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", () => {
      window.onNavigate(ROUTES_PATH.Bills)

      const windowIcon = screen.getByTestId('icon-window')
      
      expect(windowIcon).toHaveClass('active-icon')
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((Date.parse(a.date) < Date.parse(b.date)) ? -1 : 1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("New button opens a form", () => {
      // Construct the front
      document.body.innerHTML = BillsUI({ data: [bills] })

      // Get new button
      const btnNewBill = screen.getByTestId('btn-new-bill')

      // Setup bills and router 
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const billsPage = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })
      const handleClickNewBill = jest.fn(() => billsPage.onNavigate(ROUTES_PATH['NewBill']))
      btnNewBill.addEventListener('click', handleClickNewBill)

      // Fire event
      userEvent.click(btnNewBill)

      // Matcher verification
      expect(handleClickNewBill).toHaveBeenCalled()
      
      // Check we have moved to new bill page
      const form = screen.getAllByTestId('form-new-bill')
      expect(form).toBeTruthy()             
    })

    test("Clicking the eye icon opens a modal", ()=> {        
      // Construct the front 
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const billsPage = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      document.body.innerHTML = BillsUI({data: [bills[0]]})

      // Get elements and setup the DOM
      const modale = document.getElementById('modaleFile')
      $.fn.modal = jest.fn(() => modale.classList.add("show"))

      const iconEye = screen.getByTestId('icon-eye')
      const handleClickIconEye = jest.fn(() => billsPage.handleClickIconEye(iconEye))
      iconEye.addEventListener('click', handleClickIconEye)

      // Fire event
      userEvent.click(iconEye)
      
      // Matchers
      expect(handleClickIconEye).toHaveBeenCalled()
    })

    test("Get bills from mock API", () => {
      // Construct the front
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      // Get DOM elements
      const btnNewBill = screen.getByTestId("btn-new-bill")

      // Matchers
      expect(btnNewBill).toBeTruthy()
      const btnEye= screen.getAllByTestId("icon-eye")
      expect(btnEye).not.toHaveLength(0)
    })

  })
})
