#-*- coding: utf-8 -*-

from openerp import tools, SUPERUSER_ID
from openerp import models, api, _,  fields
from openerp.osv import osv
from openerp.http import request, Response
from openerp.addons.website.models.website import slug


class devheart_project_addressed_issues(models.Model):
    _name = "project.addressed.issues"
    _description = "issues addressed by the current projet"
    _order = 'sequence desc, name'

#    _constraints = [
#            (osv.osv._check_resursion, 'error! you cannot create recursive
#            "projectissues".', ['parent_id'])
#            ]

    def name_get(self, cr, uid, ids, context=None):
        if not len(ids):
            return []
        reads = self.read(cr, uid, ids, ['name','parent_id'], context=context)
        res = []
        for record in reads:
            name = record['name']
            if record['parent_id']:
                name = record['parent_id'][1]+' / '+name
            res.append((record['id'], name))
        return res

    def _name_get_fnc(self, cr, uid, ids, prop, unknow_none, context=None):
        res = self.name_get(cr, uid, ids, context=context)
        return dict(res)




    name =  fields.Char('Name', required=True, translate=True)
    #full_name = fields.Char(compute='_name_get_fnc', string='Full Name')
    parent_id = fields.Many2one('project.addressed.issues','Parent Category', select=True)
    child_id = fields.One2many('project.addressed.issues', 'parent_id', string='Children Categories')
    sequence = fields.Integer('Sequence', help="Gives the sequence order when displaying a list of projects.")



class devheart_project(models.Model):
    _inherit = ['project.project','website.seo.metadata']

    _name = "project.project"
    _mail_post_access = 'read'

    @api.one
    def _website_url(self):
        cr = self.env.cr
        uid = self.env.uid
        context = self.env.context
        ids = [self.id]

        host = request.httprequest.headers.environ.get('HTTP_HOST')
        res = dict.fromkeys(ids, '')
        for project in self.browse(ids):
            url = 'http://%s/project/%s' % (host, slug(project))
        self.website_url = url

    def get_google_drive_url(self):
        cr = self.env.cr
        uid = self.env.uid
        registry = self.env.registry
        context = self.env.context
        ids = [self.id]

        project_model_id = registry["ir.model"].search(cr, uid, [('model','=', 'project.project')], context=context)[0]
        config_dict = self.env.registry["google.drive.config"].get_google_drive_config(cr, uid, project_model_id, self.id, context=context)
        if config_dict and isinstance(config_dict, list):
            config_dict = config_dict[0]
        else:
            config_dict = {}

        config_id = config_dict.get('id') or 0
        res_id = self.id
        config = self.env.registry["google.drive.config"].browse(cr, SUPERUSER_ID, config_id, context=context)
        model = config.model_id #or project_model_id
        filter_name = config.filter_id and config.filter_id.name or False

        record = {}
        record['name'] = self.name
        record.update({'model': model.name, 'filter': filter_name})
        name_gdocs = config.name_template
        try:
            name_gdocs = name_gdocs % record
        except:
            name_gdocs = ''
            #raise osv.except_osv(_('Key Error!'), _("At least one key cannot be found in your Google Drive name pattern"))

        attach_pool = self.pool.get("ir.attachment")
        attach_ids = attach_pool.search(cr, uid, [('res_model', '=', model.model), ('name', '=', name_gdocs), ('res_id', '=', res_id)])
        url = False
        if attach_ids:
            attachment = attach_pool.browse(cr, uid, attach_ids[0], context)
            url = attachment.url
        #else:
        #    url =self.env.registry["google.drive.config"].copy_doc(cr, uid, self.id, config_id, name_gdocs,project_model_id, context).get('url')
        self.google_drive_url =  url



    #description_pad     = fields.Char('Description PAD', pad_content_field='description')
    website_url         = fields.Char(compute='_website_url', string='Project URL', store=False)
    google_drive_url    = fields.Char(compute='get_google_drive_url', string='Project Google Document', store=False)
    addressed_issues    = fields.Many2many('project.addressed.issues', string='Addressed Issues', help="Projects addressing the same issues can be grouped together")
    skills              = fields.Many2many('project.category', string='Skills', help="The skills required for the project")
    short_desc          = fields.Text(string='Short desc')
    long_desc           = fields.Html(string='Long desc')
    customer_contact    = fields.Many2one('res.users', string="Customer contact" )
    git_path            = fields.Char(default=False)
    image               = fields.Binary(string=_("Image"))
    partner_id          = fields.Many2one("res.partner", domain=[ ( 'is_company', '=', True ) ])

    def _get_default_sequence(self, cr, uid, *l, **kwargs):
        cr.execute('SELECT MAX(sequence)+1 FROM project_project')
        return cr.fetchone()[0] or 0

    _defaults = {
            'sequence' : _get_default_sequence,
            }




