#-*- coding: utf-8 -*-

from openerp import tools, SUPERUSER_ID
from openerp import models, api, _,  fields
from openerp.osv import osv
from openerp.http import request, Response
from openerp.addons.website.models.website import slug

class devheart_partner(models.Model):
    _inherit = ['res.partner','website.seo.metadata']

    _name = "res.partner"

    related_user = fields.Many2one("res.users", string=_('Related User'))

    @api.model
    def get_current_user(self):
        related_user = self.env['res.users'].browse(self.env.uid) or False
        if related_user:
            self.related_user = related_user[0]

    def get_current_user_partner_form_view(self):
        context = request.context
        context = {}
        #return the business form view
        view_id = 0
        view_proxy  = self.pool.get('ir.ui.view')

        action = {
                'type' : 'ir.actions.act_window',
                'name' : 'Mon profile',
                'view_type': 'form',
                'view_mode': 'form',
                'res_model' : 'res.users',
                'res_id' : request.uid,
                'context' : context,
                'nodestroy':True,
                }

        return action


class devheart_user(models.Model):
    _inherit = ['res.users','website.seo.metadata']

    _name = "res.users"
    _mail_post_access = 'read'


    biography           = fields.Html('Description')
    skills              = fields.Many2many('project.category', string='Skills', help="Your skills")
    social_skype        = fields.Char(string="Skype")
    social_facebook     = fields.Char(string="Facebook", default=False)
    social_linkedin     = fields.Char(string="=Linkedin", default=False)
    social_twitter      = fields.Char(string="twitter", default=False)
    parent_id           = fields.Many2one("res.partner", string="Organisation", domain=[ ('is_company', '=', True) ])

