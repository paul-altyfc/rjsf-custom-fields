import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Form from 'react-jsonschema-form'

import './App.css'

/**
 * Custom field is defined as a standard React component
 * Props:
 * - schema: - {} - defines the subset of schema for the prop the field is registered to - address in this case
 * - required - bool - is this marked as required
 * - uiSchema - {} - subset of the UI Schema for the prop the field is registered to
 * - errorSchema {} - ???
 * - idSchema - {} - lists the expected ids for the elements
 * - formData - {} - subset of formData that pertains to this field
 * - registry: {}
 *  -- fields - {} - fields registered within this part of the schema?
 *  -- widgets - {} - widgets registered within this part of the schema?
 *  -- definitions - {} - ???
 *  -- formContext - {} - ???
 * - disabled - bool
 * - readonly - bool
 * - autofocus - bool
 * - formContext - {} - ??? - yup, separate formContext from the one above
 * - onChange - fn to propagate changes up to the containing form
 */

class AddressForm extends Component {
  state = {
    street: '',
    street2: '',
    city: '',
    state: '', // enum
    postalCode: ''
  }

  // This handles getting updated props into state - since values need to be updated locally on state,
  // but props can also be controlled from outside the component, we need to merge incoming values into
  // state
  static getDerivedStateFromProps(nextProps, prevState) {
    const newState = {
      ...prevState,
      ...nextProps.formData
    }
    return newState
  }

  onChange = name => evt => {
    this.setState(
      {
        [name]: evt.target.value
      },
      () => this.props.onChange(this.state)
    )
  }

  loadZip = evt => {
    evt.preventDefault()
    // Imagine an XHR call to lookup zip based on address info
    // Contrived, but it makes the point
    setTimeout(() => {
      this.setState({ postalCode: '08007' }, () =>
        this.props.onChange(this.state)
      )
    }, 500)
  }

  render() {
    return (
      <div>
        {/* This is a handy way to inspect the rather large props object that gets passed in */}
        {/* <div>{JSON.stringify(this.props, null, 2)}</div> */}
        <input
          type="text"
          onChange={this.onChange('street')}
          placeholder="street"
          value={this.state.street}
          disabled={this.props.disabled}
        />
        <input
          type="text"
          onChange={this.onChange('street2')}
          placeholder="street line two"
          value={this.state.street2}
          disabled={this.props.disabled}
        />
        <input
          type="text"
          onChange={this.onChange('city')}
          placeholder="city"
          value={this.state.city}
          disabled={this.props.disabled}
        />
        <input
          type="text"
          onChange={this.onChange('state')}
          placeholder="state"
          value={this.state.state}
          disabled={this.props.disabled}
        />
        <input
          type="text"
          onChange={this.onChange('postalCode')}
          placeholder="postal code"
          value={this.state.postalCode}
          disabled={this.props.disabled}
        />
        <button onClick={this.loadZip} disabled={this.props.disabled}>
          load zip
        </button>
      </div>
    )
  }
}

// Create a mapping of custom field names to Components
const fields = {
  address: AddressForm
}

const schema = {
  title: 'Custom Fields',
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    address: {
      type: 'object',
      title: 'Address',
      properties: {
        street: { type: 'string' },
        street2: { type: 'string' },
        city: { type: 'string' },
        state: {
          type: 'string',
          enum: ['MA', 'NC', 'CA', 'NY', 'MI', 'OH', 'KY']
        },
        postalCode: { type: 'string' }
      }
    }
  }
}

const formData = {
  name: '',
  address: {
    street: '',
    street2: '',
    city: '',
    state: '',
    postalCode: ''
  }
}

// subfields class is adding indentation and a left border
// By default, the fields will look like part of a single form
// with everything at the same level
const uiSchema = {
  'ui:disabled': true, // enable/disable entire form
  name: { 'ui:title': 'Full Name' },
  address: {
    'ui:field': 'address', // associate the address section of schema with the address custom field
    classNames: 'subfields',
    street: {
      classNames: 'subfields'
    }
  }
}

class CustomFieldsImp extends Component {
  state = {
    formData: { ...this.props.formData },
    uiSchema: { ...this.props.uiSchema }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const newState = {
      ...prevState,
      formData: { ...nextProps.formData },
      uiSchema: { ...prevState.uiSchema, 'ui:disabled': nextProps.isDisabled }
    }
    return newState
  }

  handleCancel = evt => {
    // Just reset formData
    this.setState({ formData: this.props.formData })
  }

  render() {
    return (
      <div>
        <Form
          schema={this.props.schema}
          uiSchema={this.state.uiSchema}
          formData={this.state.formData}
          fields={this.props.fields}
          onSubmit={console.log.bind(console)}
        >
          {/*Passing children to form allows you to override the default submit add a cancel - must have a type[submit] to trigger form*/}
          {/*Default is a single button with btn-primary & no cancel*/}
          <div>
            <button className="btn btn-success" type="submit">
              Submit
            </button>
            <button
              className="btn btn-link"
              type="button"
              onClick={this.handleCancel}
            >
              Cancel
            </button>
          </div>
        </Form>
      </div>
    )
  }
}

class CustomFields extends Component {
  state = {
    formData,
    schema,
    fields,
    uiSchema,
    isDisabled: false
  }

  sendData = evt => {
    evt.preventDefault()
    console.log('Setting formData')

    this.setState({
      formData: {
        name: 'Default',
        address: {
          street: '111 E. Elm St',
          street2: '',
          city: 'Anywhere',
          state: 'MI',
          postalCode: '20345'
        }
      }
    })
  }

  toggleForm = () => {
    this.setState(state => ({ isDisabled: !state.isDisabled }))
  }

  render() {
    console.log('rendering with state', this.state)
    return (
      <div>
        <button onClick={this.sendData}>Send Updated Data into Form</button>
        <label htmlFor="disableForm">Disable form?</label>
        <input
          type="checkbox"
          name="disableForm"
          checked={this.state.isDisabled}
          onChange={this.toggleForm}
        />
        {/*Add some top-level controls to manipulate the data to show the capabilities - like disabling an entire custom field in one shot*/}
        <CustomFieldsImp
          formData={this.state.formData}
          schema={this.state.schema}
          fields={this.state.fields}
          uiSchema={this.state.uiSchema}
          isDisabled={this.state.isDisabled}
        />
      </div>
    )
  }
}

const rootElement = document.getElementById('root')
ReactDOM.render(<CustomFields />, rootElement)
