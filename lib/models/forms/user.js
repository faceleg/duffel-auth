var S = require('string'),
  User = require('duffel-auth').User(),
  permissions = require('../../functions/permissions').simplePermissions,

  // @todo render permission tree in form
  //permissions = require('duffel-auth').permissionTree,

  forms = require('forms'),
  fields = forms.fields,
  widgets = forms.widgets,
  validators = forms.validators;

module.exports = {
  edit: function(loggedInUser) {
    var permissionChoices = {};
    permissions().forEach(function(permission) {
      permissionChoices[permission.name] = S(permission.name).humanize()
    });

    var formFields = {
      name: fields.string({
        required: true
      }),
      email: fields.email(),
      confirmed: fields.boolean(),
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
      });
    }
    formFields.permissions = fields.array({
      choices: permissionChoices,
      widget: widgets.multipleCheckbox()
    });

    return forms.create(formFields);
  }
}
