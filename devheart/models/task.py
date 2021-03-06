#-*- coding: utf-8 -*-

from openerp import tools, SUPERUSER_ID
from openerp import models, api, _,  fields
from openerp.osv import osv
from openerp.http import request, Response
from openerp.addons.website.models.website import slug

class devheart_task(models.Model):
    _inherit = ["project.task", 'website.seo.metadata']
    _name = "project.task"

    long_desc = fields.Text(string=_("Description"))

    @api.one
    def get_google_drive_url(self):
        cr = self.env.cr
        uid = self.env.uid
        registry = self.env.registry
        context = self.env.context
        ids = [self.id]

        task_model_id = registry["ir.model"].search(cr, uid, [('model','=', 'project.task')], context=context)[0]
        config_dict = self.env.registry["google.drive.config"].get_google_drive_config(cr, uid, task_model_id, self.id, context=context)
        if config_dict and isinstance(config_dict, list):
            config_dict = config_dict[0]
        else:
            config_dict = {}

        config_id = config_dict.get('id') or 0
        res_id = self.id
        config = self.env.registry["google.drive.config"].browse(cr, SUPERUSER_ID, config_id, context=context)
        model = config.model_id #or task_model_id
        filter_name = config.filter_id and config.filter_id.name or False

        record = {}
        record['name'] = self.name
        record.update({'model': model.name, 'filter': filter_name})
        name_gdocs = config.name_template
        try:
            name_gdocs = name_gdocs % record
        except:
            name_gdocs = ''

        attach_pool = self.pool.get("ir.attachment")
        attach_ids = attach_pool.search(cr, uid, [('res_model', '=', model.model), ('name', '=', name_gdocs), ('res_id', '=', res_id)])
        url = False
        if attach_ids:
            attachment = attach_pool.browse(cr, uid, attach_ids[0], context)
            url = attachment.url
        self.google_drive_url =  url

    @api.one
    def get_attached_docs_count(self):
        cr = self.env.cr
        uid = self.env.uid
        registry = self.env.registry
        context = self.env.context
        res_id = self.id

        task_model_id = registry["ir.model"].search(cr, uid, [('model','=', 'project.task')], context=context)[0]

        attach_pool = self.pool.get("ir.attachment")
        attach_ids = attach_pool.search(cr, uid, [ ('res_id', '=', res_id)])

        self.attached_docs_count = len(attach_ids)


    attached_docs_count = fields.Integer(string=_('Attached docs count'), compute='get_attached_docs_count')


    google_drive_url    = fields.Char(compute='get_google_drive_url', string=_('Task Descripton Google Document'), store=False)

    @api.one
    @api.onchange('categ_ids')
    def onchange_tags(self):
        #add task tags to project tags
        vals = []
        obj = self.sudo() #superuserid
        for categ in obj.categ_ids:
            vals.append((4, categ.id, {}))
        if vals: obj.project_id.write({'skills': vals})

    categ_ids = fields.Many2many('project.category', onchange="onchange_tags")

    @api.one
    @api.onchange('user_id')
    def onchange_user_id(self):
        #add user to project members / contributors
        obj = self.sudo() #superuserid
        vals = [( 4, obj.user_id.id, {} )]
        if obj.user_id :
            obj.project_id.write({'members': vals})
            # now fetch the record for status = wip (en cours)
            status_wip = self.env.registry.get('ir.model.data').get_object(
                    self.env.cr,
                    self.env.uid,
                    'devheart',
                    'project_task_type_wip'
                )
            if status_wip: self.stage_id = status_wip.id
        else:
            status_todo = self.env.registry.get('ir.model.data').get_object(
                    self.env.cr,
                    self.env.uid,
                    'devheart',
                    'project_task_type_todo'
                )
            if status_todo: self.stage_id = status_todo.id


    user_id = fields.Many2one('res.users', onchange="onchange_user_id", default=False)
