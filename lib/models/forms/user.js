var S = require('string'),
  User = require('duffel-auth').User(),
  permissions = require('../../functions/permissions').permissionNames,
  check = require('validator').check,
  forms = require('forms'),
  fields = forms.fields,
  widgets = forms.widgets,
  validators = forms.validators;

module.exports = {
  create: function(loggedInUser) {

    var permissionChoices = {};
    permissions().forEach(function(permission) {
      permissionChoices[permission] = S(permission).humanize();
    });

    var formFields = {
      email: fields.email({
        required: validators.required('Email is required'),
        validators: [validators.matchField('email')]
      }),
      password: fields.password({
        required: validators.required('Password is required'),
      }),
      confirm:  fields.password({
        required: validators.required('Must match password'),
        validators: [validators.matchField('password')]
      }),
      confirmed: fields.boolean({
        cssClasses: {
          label: ['field__label--checkbox'],
        }
      }),
      status: fields.string({
        choices: {
          'Active': User.statuses.ACTIVE,
          'Inactive': User.statuses.INACTIVE,
          'Deleted': User.statuses.DELETED
        },
        widget: widgets.select()
      })
    };

    if (loggedInUser.super) {
      formFields.super = fields.boolean({
        label: 'Super User',
        cssClasses: {
          label: ['field__label--checkbox'],
        }
      });
    }

    formFields.permissions = fields.array({
      choices: permissionChoices,
      widget: widgets.multipleCheckbox()
    });

    return forms.create(formFields);
  },

  edit: function(loggedInUser) {

    var permissionChoices = {};
    permissions().forEach(function(permission) {
      permissionChoices[permission] = S(permission).humanize();
    });

    var formFields = {
      email: fields.email({
        required: validators.required('Email is required'),
        validators: [validators.matchField('email')]
      }),
      password: fields.password(),
      confirm:  fields.password({
        validators: [function(form, validators, callback) {
          if (form.data.password !== form.data.confirm) {
            return callback('Password and confirmation must match');
          }
          callback();
        }]
      }),
      confirmed: fields.boolean({
        cssClasses: {
          label: ['field__label--checkbox'],
        }
      }),
      status: fields.string({
        choices: {
          'Active': User.statuses.ACTIVE,
          'Inactive': User.statuses.INACTIVE,
          'Deleted': User.statuses.DELETED
        },
        widget: widgets.select()
      })
    };

    if (loggedInUser.super) {
      formFields.super = fields.boolean({
        label: 'Super User',
        cssClasses: {
          label: ['field__label--checkbox'],
        }
      });
    }

    formFields.permissions = fields.array({
      choices: permissionChoices,
      widget: widgets.multipleCheckbox()
    });

    return forms.create(formFields);
  }
};
