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
        widget: widgets.checkbox({ classes: ['pull-left'] })
      }),
      status: fields.string({
        choices: {
          'Active': User.statuses.ACTIVE,
          'Deleted': User.statuses.DELETED
        },
        widget: widgets.select()
      })
    };

    if (loggedInUser.super) {
      formFields.super = fields.boolean({
        label: 'Super User',
        widget: widgets.checkbox({
          classes: ['pull-left']
        })
      });
    }

    formFields['permissions[]'] = fields.array({
      choices: permissionChoices,
      widget: widgets.multipleCheckbox()
    });

    return forms.create(formFields);
  }
};
