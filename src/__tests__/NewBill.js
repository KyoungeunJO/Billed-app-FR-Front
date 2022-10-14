/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import userEvent from "@testing-library/user-event"
import mockStore from "../__mocks__/store"

jest.mock("../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {

  beforeAll(() => {
    // Login user
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: 'employee@test.tld'
    }))
    // Construct the front
    document.body.innerHTML = NewBillUI()
  })

  describe("When I am on NewBill Page", () => {
    test("Uploading a wrong extension triggers an error", ( )=> {
      // Get DOM elements
      const fileInput = screen.getByTestId('file')

      // Create instance of NewBillPage and set events
      const onNavigate = (pathname) => document.body.innerHTML = ROUTES({ pathname })
      const newBillPage = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      const handleChangeFile = jest.fn((e) => newBillPage.handleChangeFile(e))
      fileInput.addEventListener("change", handleChangeFile)

      // Fire event
      userEvent.click(fileInput)
      fireEvent.change(fileInput, {
        target: {
          files: [new File(['any content'], 'file.txt', {type: 'text/plain'})],
        },
      })

      // Matchers
      expect(fileInput.files[0].type).not.toMatch(/(image\/jpg)|(image\/jpeg)|(image\/png)/gm)
      expect(fileInput.checkValidity()).toBe(false)
    })

    test('Submit bill with mock API', async () => {
      const onNavigate = (pathname) => document.body.innerHTML = ROUTES({ pathname })
      const newBillPage = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

      // Fill the NewBill form
      const typeInput = screen.getByTestId("expense-type");
      fireEvent.change(typeInput, { target: { value: "Transports" } })

      const inputDate = screen.getByTestId("datepicker")
      fireEvent.change(inputDate, { target: { value: "2022-10-21" } })
      
      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, { target: { value: "45" } })

      const inputPct = screen.getByTestId("pct");
      fireEvent.change(inputPct, { target: { value: "20" } })

      const fileInput = screen.getByTestId('file')
      fireEvent.change(fileInput, {
        target: {
          files: [new File(['any content'], 'file.jpg', {type: 'image/jpg'})],
        },
      })

      // Mock form submission
      const handleSubmit = jest.spyOn(newBillPage, 'handleSubmit')
      const form = screen.getByTestId('form-new-bill')
      form.addEventListener('submit', handleSubmit)
      fireEvent.submit(form)

      // Matchers
      expect(handleSubmit).toHaveBeenCalled();
    });

  })
})
